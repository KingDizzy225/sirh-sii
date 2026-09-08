const prisma = require('../prismaClient');

/**
 * Requêteur : listes et exports à la demande.
 *
 * Les tableaux de bord sont figés. Or une RH a besoin, plusieurs fois par mois,
 * d'une liste qu'aucun écran ne propose — telles colonnes, tel filtre, exportée
 * dans un tableur. Sans cet outil, chaque demande passe par un développeur, et
 * la plupart n'aboutissent jamais.
 *
 * Deux principes tenus ici.
 *
 * Rien n'est ouvert par défaut : les sujets, les colonnes et les opérateurs
 * sont énumérés. Un requêteur qui accepterait un nom de table ou de champ venu
 * de la requête laisserait interroger toute la base, dossiers médicaux compris.
 *
 * Les colonnes sensibles sont marquées comme telles. Elles restent
 * disponibles — une RH a le droit d'exporter des salaires — mais l'export dit
 * ce qu'il contient, pour que personne ne le transfère sans y penser.
 */

const SUJETS = {
    salaries: {
        libelle: 'Salariés',
        modele: 'employee',
        parDefaut: ['lastName', 'firstName', 'department', 'positionTitle', 'status'],
        colonnes: {
            lastName: { libelle: 'Nom', type: 'texte' },
            firstName: { libelle: 'Prénom', type: 'texte' },
            email: { libelle: 'Email', type: 'texte' },
            matricule: { libelle: 'Matricule', type: 'texte' },
            cnpsNumber: { libelle: 'Numéro CNPS', type: 'texte' },
            department: { libelle: 'Département', type: 'texte' },
            positionTitle: { libelle: 'Poste', type: 'texte' },
            status: { libelle: 'Statut', type: 'texte' },
            contractType: { libelle: 'Type de contrat', type: 'texte' },
            hireDate: { libelle: "Date d'embauche", type: 'date' },
            exitDate: { libelle: 'Date de sortie', type: 'date' },
            contractEndDate: { libelle: 'Fin de contrat', type: 'date' },
            gender: { libelle: 'Genre', type: 'texte' },
            phone: { libelle: 'Téléphone', type: 'texte' },
            annualLeaveBalance: { libelle: 'Solde de congés', type: 'nombre' },
            childrenCount: { libelle: 'Enfants à charge', type: 'nombre' },
            baseSalary: { libelle: 'Rémunération', type: 'nombre', sensible: true },
            bankAccount: { libelle: 'Compte bancaire', type: 'texte', sensible: true }
        }
    },
    paies: {
        libelle: 'Bulletins de paie',
        modele: 'payroll',
        parDefaut: ['period', 'grossSalary', 'netSalary', 'status'],
        sensibleParNature: true,
        relation: { cle: 'employee', colonnes: ['lastName', 'firstName', 'department'] },
        colonnes: {
            period: { libelle: 'Période', type: 'date' },
            baseSalary: { libelle: 'Salaire de base', type: 'nombre' },
            bonus: { libelle: 'Primes', type: 'nombre' },
            grossSalary: { libelle: 'Brut', type: 'nombre' },
            cnpsEmployee: { libelle: 'CNPS salarié', type: 'nombre' },
            cmu: { libelle: 'CMU', type: 'nombre' },
            its: { libelle: 'ITS', type: 'nombre' },
            employerContributions: { libelle: 'Charges patronales', type: 'nombre' },
            netSalary: { libelle: 'Net', type: 'nombre' },
            status: { libelle: 'Statut', type: 'texte' }
        }
    },
    conges: {
        libelle: 'Congés et absences',
        modele: 'leave',
        parDefaut: ['type', 'startDate', 'endDate', 'durationDays', 'status'],
        relation: { cle: 'employee', colonnes: ['lastName', 'firstName', 'department'] },
        colonnes: {
            type: { libelle: 'Type', type: 'texte' },
            startDate: { libelle: 'Début', type: 'date' },
            endDate: { libelle: 'Fin', type: 'date' },
            durationDays: { libelle: 'Jours', type: 'nombre' },
            status: { libelle: 'Statut', type: 'texte' },
            reason: { libelle: 'Motif', type: 'texte' }
        }
    },
    pointages: {
        libelle: 'Pointages',
        modele: 'timeLog',
        parDefaut: ['timestamp', 'type'],
        relation: { cle: 'employee', colonnes: ['lastName', 'firstName', 'department'] },
        colonnes: {
            timestamp: { libelle: 'Horodatage', type: 'date' },
            type: { libelle: 'Sens', type: 'texte' },
            withinPerimeter: { libelle: 'Dans la zone', type: 'booleen' },
            distanceMeters: { libelle: 'Distance au site (m)', type: 'nombre' }
        }
    },
    depenses: {
        libelle: 'Notes de frais',
        modele: 'expense',
        parDefaut: ['date', 'category', 'amount', 'status'],
        relation: { cle: 'employee', colonnes: ['lastName', 'firstName', 'department'] },
        colonnes: {
            date: { libelle: 'Date', type: 'date' },
            category: { libelle: 'Catégorie', type: 'texte' },
            amount: { libelle: 'Montant', type: 'nombre' },
            status: { libelle: 'Statut', type: 'texte' },
            description: { libelle: 'Description', type: 'texte' }
        }
    }
};

const OPERATEURS = {
    egal: (v) => v,
    contient: (v) => ({ contains: String(v), mode: 'insensitive' }),
    superieur: (v) => ({ gte: v }),
    inferieur: (v) => ({ lte: v }),
    nonVide: () => ({ not: null }),
    vide: () => null
};

/** Catalogue rendu à l'écran : ce qui est interrogeable, et rien d'autre. */
function catalogue() {
    return Object.entries(SUJETS).map(([code, s]) => ({
        code,
        libelle: s.libelle,
        parDefaut: s.parDefaut,
        avecSalarie: Boolean(s.relation),
        sensibleParNature: Boolean(s.sensibleParNature),
        colonnes: Object.entries(s.colonnes).map(([cle, c]) => ({ cle, ...c }))
    }));
}

const convertir = (valeur, type) => {
    if (type === 'nombre') {
        const n = Number(valeur);
        return Number.isFinite(n) ? n : null;
    }
    if (type === 'date') {
        const d = new Date(valeur);
        return isNaN(d.getTime()) ? null : d;
    }
    if (type === 'booleen') return valeur === true || valeur === 'true';
    return String(valeur);
};

/**
 * Exécute une requête.
 * @returns {Promise<{colonnes:object[], lignes:object[], total:number, sensible:boolean}>}
 */
async function executer({ sujet, colonnes, filtres, tri, ordre, limite }) {
    const definition = SUJETS[sujet];
    if (!definition) {
        const e = new Error(`Sujet inconnu : ${sujet}.`);
        e.code = 'SUJET';
        throw e;
    }

    const retenues = (Array.isArray(colonnes) && colonnes.length > 0 ? colonnes : definition.parDefaut)
        .filter((c) => definition.colonnes[c]);
    if (retenues.length === 0) {
        const e = new Error('Aucune colonne valable demandée.');
        e.code = 'COLONNES';
        throw e;
    }

    const where = {};
    for (const f of Array.isArray(filtres) ? filtres : []) {
        const colonne = definition.colonnes[f && f.colonne];
        const operateur = OPERATEURS[f && f.operateur];
        if (!colonne || !operateur) continue;
        const valeur = ['vide', 'nonVide'].includes(f.operateur)
            ? null
            : convertir(f.valeur, colonne.type);
        if (!['vide', 'nonVide'].includes(f.operateur) && valeur === null) continue;
        where[f.colonne] = operateur(valeur);
    }

    const select = Object.fromEntries(retenues.map((c) => [c, true]));
    if (definition.relation) {
        select[definition.relation.cle] = {
            select: Object.fromEntries(definition.relation.colonnes.map((c) => [c, true]))
        };
    }

    const champTri = definition.colonnes[tri] ? tri : retenues[0];
    const sens = ordre === 'asc' ? 'asc' : 'desc';

    // Le plafond protège autant la base que le navigateur : un export de
    // cent mille lignes n'est utile à personne et bloque les deux.
    const plafond = Math.min(parseInt(limite, 10) || 1000, 5000);

    const [lignes, total] = await Promise.all([
        prisma[definition.modele].findMany({
            where, select, orderBy: { [champTri]: sens }, take: plafond
        }),
        prisma[definition.modele].count({ where })
    ]);

    const enTetes = retenues.map((c) => ({ cle: c, ...definition.colonnes[c] }));
    if (definition.relation) {
        enTetes.unshift(
            { cle: '_salarie', libelle: 'Salarié', type: 'texte' },
            { cle: '_departement', libelle: 'Département', type: 'texte' }
        );
    }

    const plates = lignes.map((l) => {
        const ligne = { ...l };
        if (definition.relation && l[definition.relation.cle]) {
            const e = l[definition.relation.cle];
            ligne._salarie = `${e.lastName || ''} ${e.firstName || ''}`.trim();
            ligne._departement = e.department || '';
            delete ligne[definition.relation.cle];
        }
        return ligne;
    });

    const sensible = Boolean(definition.sensibleParNature) ||
        retenues.some((c) => definition.colonnes[c].sensible);

    return {
        sujet: definition.libelle,
        colonnes: enTetes,
        lignes: plates,
        total,
        tronque: total > plates.length,
        plafond,
        // Dit à l'écran et à l'export ce qu'ils contiennent : une liste de
        // salaires ne se transfère pas comme une liste de départements.
        sensible
    };
}

/** Rend le résultat au format CSV, séparateur point-virgule. */
function versCsv(resultat) {
    const echapper = (v) => {
        if (v === null || v === undefined) return '';
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        const texte = String(v);
        return /[";\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
    };

    const lignes = [resultat.colonnes.map((c) => echapper(c.libelle)).join(';')];
    for (const l of resultat.lignes) {
        lignes.push(resultat.colonnes.map((c) => echapper(l[c.cle])).join(';'));
    }
    // Le point-virgule et la marque d'octets sont ce qu'attend un tableur
    // configuré en français : sans eux, tout arrive dans une seule colonne.
    return '﻿' + lignes.join('\r\n');
}

module.exports = { SUJETS, OPERATEURS, catalogue, executer, versCsv };
