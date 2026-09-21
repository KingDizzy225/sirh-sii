const prisma = require('../prismaClient');

/**
 * Astreintes : rester joignable sans être au travail.
 *
 * Le planning d'équipe couvrait les tournées, pas l'astreinte. Or elle n'est
 * ni du temps de travail effectif, ni du repos : elle se compense, et elle se
 * planifie. Sans trace, trois choses se perdaient — qui couvre la nuit de
 * samedi, ce qui est dû à celui qui l'a couverte, et le fait qu'un même
 * technicien enchaîne trois week-ends de suite.
 *
 * **Une intervention n'est pas une astreinte.** Être appelé et travailler,
 * c'est du temps de travail effectif : il relève des heures supplémentaires,
 * avec leurs majorations. Le module compte les interventions pour ce qu'elles
 * disent de la charge réelle, et ne les paie pas en indemnité — les confondre
 * reviendrait à payer au forfait des heures majorées.
 *
 * **Aucun forfait n'est inventé.** Le montant vient de `ASTREINTE_FORFAITS`,
 * un objet JSON associant un type à un montant, ou de la saisie. Sans
 * paramétrage, l'écran demande le montant au lieu de proposer un chiffre dont
 * personne ne saurait d'où il sort.
 */

const TYPES = ['SEMAINE', 'WEEKEND', 'FERIE', 'NUIT'];
const STATUTS = ['PLANIFIEE', 'EFFECTUEE', 'PAYEE', 'ANNULEE'];

/** Repos minimal attendu entre deux astreintes d'un même salarié, en jours. */
const REPOS_ENTRE_ASTREINTES_JOURS = Math.max(
    parseInt(process.env.ASTREINTE_REPOS_JOURS, 10) || 7, 0
);

/** Forfaits par type, s'ils ont été déclarés. */
function forfaits() {
    const brut = (process.env.ASTREINTE_FORFAITS || '').trim();
    if (!brut) return null;
    try {
        const lu = JSON.parse(brut);
        const retenus = {};
        for (const type of TYPES) {
            const montant = parseFloat(lu[type]);
            if (Number.isFinite(montant) && montant >= 0) retenus[type] = montant;
        }
        return Object.keys(retenus).length ? retenus : null;
    } catch {
        console.error('[ASTREINTE] ASTREINTE_FORFAITS illisible : les forfaits sont ignorés.');
        return null;
    }
}

/** Forfait d'un type, ou null s'il n'est pas paramétré. */
function forfaitPour(type, table = forfaits()) {
    if (!table) return null;
    const montant = table[String(type || '').toUpperCase()];
    return Number.isFinite(montant) ? montant : null;
}

const jours = (de, a) => (new Date(a) - new Date(de)) / 86400000;

/**
 * Chevauchements et enchaînements d'un planning. Fonction pure.
 *
 * Deux astreintes qui se chevauchent pour le même salarié sont une erreur de
 * saisie ou une double compensation ; trois week-ends d'affilée sont une usure
 * que personne ne voit passer.
 */
function anomalies(periodes) {
    const parSalarie = new Map();
    for (const p of periodes) {
        if (p.statut === 'ANNULEE') continue;
        if (!parSalarie.has(p.employeeId)) parSalarie.set(p.employeeId, []);
        parSalarie.get(p.employeeId).push(p);
    }

    const trouvees = [];
    for (const [employeeId, liste] of parSalarie) {
        const triees = [...liste].sort((a, b) => new Date(a.debut) - new Date(b.debut));
        for (let i = 1; i < triees.length; i += 1) {
            const precedente = triees[i - 1];
            const courante = triees[i];
            if (new Date(courante.debut) < new Date(precedente.fin)) {
                trouvees.push({
                    code: 'CHEVAUCHEMENT', employeeId, nom: courante.nom,
                    texte: `Deux astreintes se chevauchent à partir du ${new Date(courante.debut).toLocaleDateString('fr-FR')}.`
                });
                continue;
            }
            const repos = jours(precedente.fin, courante.debut);
            if (repos < REPOS_ENTRE_ASTREINTES_JOURS) {
                trouvees.push({
                    code: 'REPOS_INSUFFISANT', employeeId, nom: courante.nom,
                    texte: `${Math.max(Math.round(repos), 0)} jour(s) entre deux astreintes, pour ${REPOS_ENTRE_ASTREINTES_JOURS} attendu(s).`
                });
            }
        }
    }
    return trouvees;
}

/**
 * Jours d'une période sans aucune astreinte couvrante. Fonction pure.
 *
 * C'est le vrai sujet d'un planning d'astreinte : non pas qui est inscrit,
 * mais quelles nuits ne le sont pas.
 */
function trous(periodes, debut, fin) {
    const couverts = new Set();
    for (const p of periodes) {
        if (p.statut === 'ANNULEE') continue;
        const d = new Date(Math.max(new Date(p.debut).getTime(), new Date(debut).getTime()));
        const t = new Date(Math.min(new Date(p.fin).getTime(), new Date(fin).getTime()));
        for (let j = new Date(d); j <= t; j.setUTCDate(j.getUTCDate() + 1)) {
            couverts.add(j.toISOString().slice(0, 10));
        }
    }
    const manquants = [];
    for (let j = new Date(debut); j <= new Date(fin); j.setUTCDate(j.getUTCDate() + 1)) {
        const cle = j.toISOString().slice(0, 10);
        if (!couverts.has(cle)) manquants.push(cle);
    }
    return manquants;
}

/** Planning d'une période, avec ses anomalies et ses trous. */
async function planning(debut, fin) {
    const periodes = await prisma.astreinte.findMany({
        where: { debut: { lte: new Date(fin) }, fin: { gte: new Date(debut) } },
        orderBy: { debut: 'asc' },
        include: { employee: { select: { firstName: true, lastName: true, positionTitle: true } } }
    });
    const lignes = periodes.map((a) => ({
        id: a.id,
        employeeId: a.employeeId,
        nom: `${a.employee.lastName} ${a.employee.firstName}`.trim(),
        fonction: a.employee.positionTitle,
        debut: a.debut,
        fin: a.fin,
        type: a.type,
        site: a.site,
        compensation: a.compensation,
        interventions: a.interventions,
        statut: a.statut,
        commentaire: a.commentaire
    }));

    const table = forfaits();
    return {
        debut,
        fin,
        types: TYPES,
        statuts: STATUTS,
        forfaits: table,
        reposAttenduJours: REPOS_ENTRE_ASTREINTES_JOURS,
        lignes,
        anomalies: anomalies(lignes),
        joursSansCouverture: trous(lignes, debut, fin),
        aPayer: lignes.filter((l) => l.statut === 'EFFECTUEE' && l.compensation > 0)
            .reduce((s, l) => s + l.compensation, 0)
    };
}

/** Indemnités à porter sur la paie d'une période. */
async function aPayer(employeeId, periode, payrollId = null) {
    const mois = new Date(periode);
    const debut = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth(), 1));
    const fin = new Date(Date.UTC(mois.getUTCFullYear(), mois.getUTCMonth() + 1, 0, 23, 59, 59));
    return prisma.astreinte.findMany({
        where: {
            employeeId,
            debut: { gte: debut, lte: fin },
            OR: [
                { statut: 'EFFECTUEE' },
                ...(payrollId ? [{ statut: 'PAYEE', payrollId }] : [])
            ]
        }
    });
}

module.exports = {
    TYPES, STATUTS, REPOS_ENTRE_ASTREINTES_JOURS,
    forfaits, forfaitPour, anomalies, trous, planning, aPayer
};
