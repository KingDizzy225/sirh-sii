const prisma = require('../prismaClient');

/**
 * Heures travaillées, à partir des pointages.
 *
 * La chaîne était coupée au milieu : les pointages étaient enregistrés d'un
 * côté, et les heures supplémentaires ressaisies à la main dans la paie de
 * l'autre. Personne ne rapprochait les deux, et une heure supplémentaire
 * oubliée l'était définitivement.
 *
 * Ce module reconstitue les journées à partir des entrées et sorties, en dit
 * les défauts plutôt que de les combler, et propose un nombre d'heures
 * supplémentaires que la paie reprend — sans jamais l'imposer.
 */

// Durée hebdomadaire de référence, en heures. Réglable : une convention de
// branche peut retenir une autre durée.
const HEURES_HEBDO = parseFloat(process.env.TEMPS_HEURES_HEBDOMADAIRES || '40');

// Au-delà de cette durée, une journée est tenue pour aberrante : le salarié a
// vraisemblablement oublié de pointer sa sortie. La compter fausserait le mois
// entier, l'ignorer en silence aussi — elle est donc écartée et signalée.
const JOURNEE_MAX_HEURES = parseFloat(process.env.TEMPS_JOURNEE_MAX_HEURES || '16');

const HEURE = 3600 * 1000;

/** Bornes du mois demandé, au format « AAAA-MM ». */
function intervalleMois(libelle) {
    const m = /^(\d{4})-(\d{2})/.exec(String(libelle || ''));
    const maintenant = new Date();
    const annee = m ? parseInt(m[1], 10) : maintenant.getUTCFullYear();
    const mois = m ? parseInt(m[2], 10) - 1 : maintenant.getUTCMonth();
    return {
        gte: new Date(Date.UTC(annee, mois, 1)),
        lt: new Date(Date.UTC(annee, mois + 1, 1)),
        libelle: `${annee}-${String(mois + 1).padStart(2, '0')}`
    };
}

/**
 * Apparie les pointages d'un salarié en journées travaillées.
 *
 * Une entrée sans sortie n'est pas devinée : la durée serait inventée. Elle est
 * comptée comme journée incomplète, et le total du mois porte la mention.
 */
function apparier(pointages) {
    const tries = [...pointages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const journees = [];
    const anomalies = [];
    let entree = null;

    for (const p of tries) {
        if (p.type === 'CLOCK_IN') {
            if (entree) {
                // Deux entrées de suite : la première n'a jamais été refermée.
                anomalies.push({
                    type: 'SORTIE_MANQUANTE',
                    le: entree.timestamp,
                    detail: "Entrée sans sortie : la durée n'est pas comptée."
                });
            }
            entree = p;
            continue;
        }
        if (p.type === 'CLOCK_OUT') {
            if (!entree) {
                anomalies.push({
                    type: 'ENTREE_MANQUANTE',
                    le: p.timestamp,
                    detail: "Sortie sans entrée correspondante."
                });
                continue;
            }
            const heures = (new Date(p.timestamp) - new Date(entree.timestamp)) / HEURE;
            if (heures > JOURNEE_MAX_HEURES) {
                anomalies.push({
                    type: 'JOURNEE_ABERRANTE',
                    le: entree.timestamp,
                    heures: Math.round(heures * 10) / 10,
                    detail: `Journée de ${Math.round(heures)} h : sortie vraisemblablement oubliée, durée écartée.`
                });
            } else if (heures > 0) {
                journees.push({
                    debut: entree.timestamp,
                    fin: p.timestamp,
                    heures: Math.round(heures * 100) / 100,
                    horsZone: entree.withinPerimeter === false || p.withinPerimeter === false
                });
            }
            entree = null;
        }
    }

    if (entree) {
        anomalies.push({
            type: 'SORTIE_MANQUANTE',
            le: entree.timestamp,
            detail: "Entrée sans sortie : la durée n'est pas comptée."
        });
    }

    return { journees, anomalies };
}

/**
 * Heures supplémentaires du mois.
 *
 * Le décompte se fait semaine par semaine et non sur le mois entier : une
 * semaine de cinquante heures suivie d'une semaine de trente n'est pas un mois
 * ordinaire, et lisser les deux effacerait les heures dues.
 */
function heuresSupplementaires(journees) {
    const semaines = new Map();
    for (const j of journees) {
        const d = new Date(j.debut);
        // Lundi de la semaine, en clé.
        const jour = (d.getUTCDay() + 6) % 7;
        const lundi = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - jour));
        const cle = lundi.toISOString().slice(0, 10);
        semaines.set(cle, (semaines.get(cle) || 0) + j.heures);
    }

    let supplementaires = 0;
    const detail = [];
    for (const [semaine, heures] of [...semaines.entries()].sort()) {
        const sup = Math.max(heures - HEURES_HEBDO, 0);
        supplementaires += sup;
        detail.push({
            semaineDu: semaine,
            heures: Math.round(heures * 100) / 100,
            supplementaires: Math.round(sup * 100) / 100
        });
    }
    return { total: Math.round(supplementaires * 100) / 100, parSemaine: detail };
}

/**
 * Relevé du mois pour l'ensemble de l'effectif.
 * @returns {Promise<object>}
 */
async function releveMensuel(periode) {
    const mois = intervalleMois(periode);

    const pointages = await prisma.timeLog.findMany({
        where: { timestamp: { gte: mois.gte, lt: mois.lt } },
        include: {
            employee: {
                select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true }
            }
        },
        orderBy: { timestamp: 'asc' }
    });

    const parSalarie = new Map();
    for (const p of pointages) {
        if (!p.employee) continue;
        if (!parSalarie.has(p.employeeId)) parSalarie.set(p.employeeId, { salarie: p.employee, pointages: [] });
        parSalarie.get(p.employeeId).pointages.push(p);
    }

    const lignes = [];
    for (const [employeeId, { salarie, pointages: liste }] of parSalarie) {
        const { journees, anomalies } = apparier(liste);
        const heures = journees.reduce((t, j) => t + j.heures, 0);
        const sup = heuresSupplementaires(journees);

        lignes.push({
            employeeId,
            nom: `${salarie.lastName} ${salarie.firstName}`.trim(),
            departement: salarie.department,
            joursTravailles: journees.length,
            heuresTravaillees: Math.round(heures * 100) / 100,
            heuresSupplementaires: sup.total,
            parSemaine: sup.parSemaine,
            journeesHorsZone: journees.filter((j) => j.horsZone).length,
            anomalies,
            // Un relevé comportant des anomalies ne doit pas être repris tel
            // quel dans la paie : le dire vaut mieux que de laisser croire à un
            // décompte complet.
            exploitable: anomalies.length === 0
        });
    }

    lignes.sort((a, b) => a.nom.localeCompare(b.nom));

    return {
        periode: mois.libelle,
        heuresHebdomadaires: HEURES_HEBDO,
        effectifPointant: lignes.length,
        totalHeures: Math.round(lignes.reduce((t, l) => t + l.heuresTravaillees, 0) * 100) / 100,
        totalSupplementaires: Math.round(lignes.reduce((t, l) => t + l.heuresSupplementaires, 0) * 100) / 100,
        avecAnomalies: lignes.filter((l) => !l.exploitable).length,
        lignes
    };
}

module.exports = {
    HEURES_HEBDO, JOURNEE_MAX_HEURES,
    intervalleMois, apparier, heuresSupplementaires, releveMensuel
};
