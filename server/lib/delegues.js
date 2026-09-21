const prisma = require('../prismaClient');

/**
 * Délégués du personnel : obligation, mandats, réunions.
 *
 * L'application connaissait l'effectif sans rien dire de ce qu'il déclenche.
 * À partir d'un certain nombre de salariés, l'élection de délégués du
 * personnel est obligatoire en Côte d'Ivoire, avec une liste électorale, un
 * procès-verbal, des mandats datés et des réunions périodiques.
 *
 * **Deux paramètres, aucune valeur devinée.**
 *  - `DELEGUES_SEUIL_EFFECTIF` : l'effectif à partir duquel l'élection
 *    s'impose (11 par défaut, à confirmer par le cabinet) ;
 *  - `DELEGUES_BAREME` : le nombre de délégués par tranche d'effectif, fixé
 *    par arrêté. **Non renseigné par défaut** : l'écran dit alors « barème non
 *    saisi » plutôt que d'annoncer un nombre faux, qui serait pris pour argent
 *    comptant.
 *
 * Les stagiaires et apprentis ne comptent pas dans l'effectif retenu : ils ne
 * sont pas salariés.
 */

const SEUIL_EFFECTIF = parseInt(process.env.DELEGUES_SEUIL_EFFECTIF, 10) || 11;
const DUREE_MANDAT_MOIS = parseInt(process.env.DELEGUES_DUREE_MANDAT_MOIS, 10) || 24;
const PREAVIS_FIN_MANDAT_JOURS = parseInt(process.env.DELEGUES_PREAVIS_JOURS, 10) || 90;
const CONTRATS_HORS_EFFECTIF = ['STAGE', 'APPRENTISSAGE'];

/** Barème « effectif → nombre de délégués », s'il a été déclaré. */
function bareme() {
    const brut = (process.env.DELEGUES_BAREME || '').trim();
    if (!brut) return null;
    try {
        const lu = JSON.parse(brut);
        const tranches = Array.isArray(lu) ? lu : [];
        return tranches
            .filter((t) => Number.isFinite(Number(t.jusqua)) || t.jusqua === null)
            .map((t) => ({
                jusqua: t.jusqua === null ? Infinity : Number(t.jusqua),
                titulaires: Number(t.titulaires) || 0,
                suppleants: Number(t.suppleants) || 0
            }))
            .sort((a, b) => a.jusqua - b.jusqua);
    } catch {
        console.error('[DÉLÉGUÉS] DELEGUES_BAREME illisible : le barème est ignoré.');
        return null;
    }
}

/**
 * Nombre de délégués attendus pour un effectif. Fonction pure.
 * @returns {{titulaires: number, suppleants: number}|null} null si le barème manque
 */
function attendus(effectif, table = bareme()) {
    if (!table || table.length === 0) return null;
    // Une tranche ouverte s'écrit `jusqua: null` — « et au-delà ». La comparer
    // telle quelle échoue en silence, puisque `n <= null` est faux : un
    // effectif au-dessus de la dernière borne chiffrée ressortirait « barème
    // muet » alors que le barème le couvre précisément. On borne donc ici,
    // sans compter sur l'appelant pour l'avoir fait.
    const bornees = table
        .map((t) => ({
            ...t,
            jusqua: t.jusqua === null || t.jusqua === undefined ? Infinity : Number(t.jusqua)
        }))
        .sort((a, b) => a.jusqua - b.jusqua);
    const tranche = bornees.find((t) => effectif <= t.jusqua);
    return tranche ? { titulaires: tranche.titulaires, suppleants: tranche.suppleants } : null;
}

const jours = (de, a) => Math.round((new Date(a) - new Date(de)) / 86400000);

/** État d'un mandat à une date. Fonction pure. */
function etatMandat(mandat, reference = new Date()) {
    if (mandat.finAnticipeeLe && new Date(mandat.finAnticipeeLe) <= reference) return 'INTERROMPU';
    if (new Date(mandat.fin) < reference) return 'ECHU';
    if (jours(reference, mandat.fin) <= PREAVIS_FIN_MANDAT_JOURS) return 'ECHEANCE_PROCHE';
    return 'EN_COURS';
}

/** Situation complète, pour l'écran et pour les alertes. */
async function situation(reference = new Date()) {
    const [salaries, mandats, dernierScrutin, reunions] = await Promise.all([
        prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, contractType: true }
        }),
        prisma.mandatDelegue.findMany({
            orderBy: { fin: 'desc' },
            include: { employee: { select: { firstName: true, lastName: true, positionTitle: true, department: true } } }
        }),
        prisma.scrutin.findFirst({ orderBy: { date: 'desc' } }),
        prisma.reunionDelegues.findMany({ orderBy: { date: 'desc' }, take: 12 })
    ]);

    const effectif = salaries.filter((s) => !CONTRATS_HORS_EFFECTIF.includes(s.contractType)).length;
    const horsEffectif = salaries.length - effectif;

    const vus = mandats.map((m) => ({
        id: m.id,
        employeeId: m.employeeId,
        nom: `${m.employee.lastName} ${m.employee.firstName}`.trim(),
        fonction: m.employee.positionTitle,
        college: m.college,
        qualite: m.qualite,
        debut: m.debut,
        fin: m.fin,
        etat: etatMandat(m, reference),
        finAnticipeeLe: m.finAnticipeeLe,
        finAnticipeeMotif: m.finAnticipeeMotif
    }));
    const enCours = vus.filter((m) => ['EN_COURS', 'ECHEANCE_PROCHE'].includes(m.etat));
    const requis = attendus(effectif);
    const derniereReunion = reunions[0] || null;

    const manques = [];
    if (effectif >= SEUIL_EFFECTIF && enCours.length === 0) {
        manques.push({
            code: 'AUCUN_DELEGUE',
            texte: `L'effectif (${effectif}) atteint le seuil de ${SEUIL_EFFECTIF} : l'élection de délégués du personnel s'impose, et aucun mandat n'est en cours.`
        });
    }
    if (requis) {
        const titulaires = enCours.filter((m) => m.qualite === 'TITULAIRE').length;
        const suppleants = enCours.filter((m) => m.qualite === 'SUPPLEANT').length;
        if (titulaires < requis.titulaires) {
            manques.push({ code: 'TITULAIRES_INSUFFISANTS', texte: `${titulaires} titulaire(s) en fonction pour ${requis.titulaires} attendu(s).` });
        }
        if (suppleants < requis.suppleants) {
            manques.push({ code: 'SUPPLEANTS_INSUFFISANTS', texte: `${suppleants} suppléant(s) en fonction pour ${requis.suppleants} attendu(s).` });
        }
    }
    for (const m of enCours.filter((x) => x.etat === 'ECHEANCE_PROCHE')) {
        manques.push({
            code: 'MANDAT_ECHEANCE',
            texte: `Le mandat de ${m.nom} s'achève le ${new Date(m.fin).toISOString().slice(0, 10)} : organiser le scrutin.`
        });
    }
    if (enCours.length > 0 && (!derniereReunion || jours(derniereReunion.date, reference) > 45)) {
        manques.push({
            code: 'REUNION_ABSENTE',
            texte: derniereReunion
                ? `Aucune réunion avec les délégués depuis le ${new Date(derniereReunion.date).toISOString().slice(0, 10)}.`
                : "Aucune réunion avec les délégués n'est enregistrée."
        });
    }

    return {
        effectif,
        horsEffectif,
        seuil: SEUIL_EFFECTIF,
        obligatoire: effectif >= SEUIL_EFFECTIF,
        baremeSaisi: requis !== null,
        requis,
        dureeMandatMois: DUREE_MANDAT_MOIS,
        mandats: vus,
        enCours: enCours.length,
        dernierScrutin,
        reunions,
        manques
    };
}

module.exports = {
    SEUIL_EFFECTIF, DUREE_MANDAT_MOIS, PREAVIS_FIN_MANDAT_JOURS, CONTRATS_HORS_EFFECTIF,
    bareme, attendus, etatMandat, situation
};
