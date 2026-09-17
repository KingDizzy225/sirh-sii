const crypto = require('crypto');
const { getPublicAppUrl } = require('./publicUrl');

/**
 * Émargement des formations.
 *
 * Le module de formation enregistrait des participations, sans rien qui
 * prouve la présence ni sa durée. Un remboursement au titre de la formation
 * professionnelle se justifie pourtant par une feuille d'émargement : qui était
 * là, de quelle heure à quelle heure.
 *
 * Même principe que la borne d'agence : un QR qui change toutes les trente
 * secondes, projeté dans la salle, scanné avec le badge. Le premier scan vaut
 * arrivée, un scan ultérieur vaut départ.
 *
 * **L'export n'est pas le formulaire du FDFP.** C'est un état de contrôle,
 * horodaté, dont le format exact de dépôt reste à confirmer.
 */

/** Un scan de départ trop proche de l'arrivée est pris pour un doublon. */
const MINUTES_AVANT_DEPART = parseInt(process.env.EMARGEMENT_MINUTES_AVANT_DEPART, 10) || 10;

const nouveauJeton = () => crypto.randomBytes(32).toString('hex');
const lienEcran = (token) => `${getPublicAppUrl()}/emargement/${token}`;
const lienScan = (id, code) => `${getPublicAppUrl()}/emarger?s=${encodeURIComponent(id)}&c=${code}`;

/**
 * Que faire d'un scan ?
 * @returns {{action: 'ARRIVEE'|'DEPART'|'DOUBLON'}}
 */
function actionScan(existant, date = new Date()) {
    if (!existant) return { action: 'ARRIVEE' };
    if (date - new Date(existant.arriveeLe) < MINUTES_AVANT_DEPART * 60000) return { action: 'DOUBLON' };
    return { action: 'DEPART' };
}

/** Heures suivies, plafonnées à la durée prévue ; null sans départ émargé. */
function heuresSuivies(emargement, dureePrevue) {
    if (!emargement?.departLe) return null;
    const heures = (new Date(emargement.departLe) - new Date(emargement.arriveeLe)) / 3600000;
    const plafond = Number(dureePrevue) > 0 ? Number(dureePrevue) : heures;
    return Math.round(Math.max(0, Math.min(heures, plafond)) * 100) / 100;
}

/**
 * Feuille d'émargement : inscrits et présents, rapprochés. Fonction pure.
 */
function feuille({ session, participations, emargements }) {
    const parSalarie = new Map(emargements.map((e) => [e.employeeId, e]));
    const lignes = [];
    const vus = new Set();

    const ligne = (salarie, e, inscrit) => {
        const heures = heuresSuivies(e, session.durationHours);
        let statut;
        if (!e) statut = 'ABSENT';
        else if (!inscrit) statut = 'NON_INSCRIT';
        else if (!e.departLe) statut = 'DEPART_NON_EMARGE';
        else statut = 'PRESENT';
        return {
            employeeId: salarie.id,
            nom: `${salarie.lastName} ${salarie.firstName}`,
            matricule: salarie.matricule || null,
            cnps: salarie.cnpsNumber || null,
            service: salarie.department || null,
            arrivee: e?.arriveeLe || null,
            depart: e?.departLe || null,
            heures,
            statut
        };
    };

    for (const p of participations) {
        vus.add(p.employeeId);
        lignes.push(ligne(p.employee, parSalarie.get(p.employeeId), true));
    }
    for (const e of emargements) {
        if (!vus.has(e.employeeId)) lignes.push(ligne(e.employee, e, false));
    }
    lignes.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    return {
        lignes,
        totaux: {
            inscrits: participations.length,
            presents: lignes.filter((l) => l.statut !== 'ABSENT').length,
            absents: lignes.filter((l) => l.statut === 'ABSENT').length,
            departsNonEmarges: lignes.filter((l) => l.statut === 'DEPART_NON_EMARGE').length,
            heures: Math.round(lignes.reduce((t, l) => t + (l.heures || 0), 0) * 100) / 100
        }
    };
}

const AVERTISSEMENT_FORMAT = "État de contrôle produit par le SIRH. Il ne reproduit pas le formulaire de dépôt du FDFP, dont le format reste à confirmer.";

/** Export CSV (séparateur « ; », marque d'ordre pour Excel). */
function versCsv({ session, organisation }, contenu) {
    const cellule = (v) => {
        const t = v === null || v === undefined ? '' : String(v);
        return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const heure = (d) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) : '');
    const STATUTS = { PRESENT: 'Présent', DEPART_NON_EMARGE: 'Départ non émargé', ABSENT: 'Absent', NON_INSCRIT: 'Présent non inscrit' };
    const lignes = [
        [AVERTISSEMENT_FORMAT],
        ['Organisme', organisation],
        ['Formation', session.title],
        ['Formateur', session.trainerName],
        ['Date', new Date(session.date).toISOString().slice(0, 10)],
        ['Durée prévue (h)', session.durationHours],
        [],
        ['Nom', 'Matricule', 'N° CNPS', 'Service', 'Arrivée (UTC)', 'Départ (UTC)', 'Heures suivies', 'Statut'],
        ...contenu.lignes.map((l) => [l.nom, l.matricule, l.cnps, l.service, heure(l.arrivee), heure(l.depart),
            l.heures === null ? '' : String(l.heures).replace('.', ','), STATUTS[l.statut]]),
        [],
        ['Inscrits', contenu.totaux.inscrits], ['Présents', contenu.totaux.presents],
        ['Absents', contenu.totaux.absents], ['Total des heures suivies', String(contenu.totaux.heures).replace('.', ',')]
    ];
    return '﻿' + lignes.map((l) => l.map(cellule).join(';')).join('\r\n');
}

module.exports = { MINUTES_AVANT_DEPART, AVERTISSEMENT_FORMAT, nouveauJeton, lienEcran, lienScan, actionScan, heuresSuivies, feuille, versCsv };
