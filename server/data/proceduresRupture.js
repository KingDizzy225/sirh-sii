/**
 * Modèles de procédure disciplinaire et de rupture.
 *
 * Ce ne sont pas les motifs qui font perdre les litiges, c'est la forme :
 * une convocation non remise, un entretien tenu le jour même, une lettre de
 * notification sans motif. Le dossier disciplinaire de l'application était un
 * journal plat — une date, un type, un motif — qui enregistrait la décision
 * sans accompagner la procédure qui la rend opposable.
 *
 * Deux précautions dans ce fichier :
 *
 *  - Les délais sont des valeurs par défaut, non des certitudes. Le Code du
 *    travail ivoirien et les conventions collectives ne fixent pas tous les
 *    mêmes durées, et une convention de branche peut être plus protectrice.
 *    Chaque délai est réglable par variable d'environnement, et l'écran affiche
 *    qu'il s'agit d'un paramétrage de l'entreprise.
 *  - Les étapes dites obligatoires le sont au sens de la procédure interne :
 *    l'application ne prétend pas dire le droit, elle empêche de sauter une
 *    étape que l'entreprise s'est donnée.
 */

const jours = (variable, defaut) => {
    const v = parseFloat(process.env[variable]);
    return Number.isFinite(v) ? v : defaut;
};

// Délai minimal entre la convocation et l'entretien : le salarié doit disposer
// du temps de préparer sa défense. Tenir l'entretien le jour de la convocation
// est le vice de forme le plus fréquent.
const DELAI_ENTRETIEN = jours('PROCEDURE_DELAI_ENTRETIEN_JOURS', 2);

// Délai laissé au salarié pour répondre à une demande d'explication écrite.
const DELAI_EXPLICATION = jours('PROCEDURE_DELAI_EXPLICATION_JOURS', 2);

// Délai maximal entre l'entretien et la notification : au-delà, le lien entre
// les faits et la sanction s'affaiblit, et la sanction se discute.
const DELAI_NOTIFICATION = jours('PROCEDURE_DELAI_NOTIFICATION_JOURS', 15);

const MODELES = {
    LICENCIEMENT: {
        libelle: 'Licenciement pour motif personnel',
        avertissement:
            "La lettre de notification doit énoncer le motif. Une rupture notifiée " +
            "sans motif écrit s'expose à être jugée abusive quel que soit le fond du dossier.",
        etapes: [
            {
                code: 'CONVOCATION',
                libelle: 'Convocation écrite à l\'entretien préalable',
                attendu: "Remise contre décharge ou lettre recommandée. Conserver la preuve de remise : c'est elle qui fera foi, pas l'envoi.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'ENTRETIEN',
                libelle: 'Entretien préalable',
                attendu: "Le salarié peut se faire assister. Consigner ce qui s'y est dit, y compris ses explications.",
                obligatoire: true,
                // Compté depuis l'étape précédente.
                delaiMinJours: DELAI_ENTRETIEN,
                motifDelai: "Le salarié doit disposer du temps de préparer sa défense."
            },
            {
                code: 'NOTIFICATION',
                libelle: 'Notification écrite et motivée de la décision',
                attendu: "Le motif figure dans la lettre. Remise contre décharge ou lettre recommandée.",
                obligatoire: true,
                delaiMinJours: 0,
                delaiMaxJours: DELAI_NOTIFICATION,
                motifDelai: "Passé ce délai, le lien entre les faits et la décision s'affaiblit."
            },
            {
                code: 'PREAVIS',
                libelle: 'Préavis exécuté ou indemnisé',
                attendu: "Durée selon la catégorie et l'ancienneté, telles que votre convention les fixe. Consigner le choix : exécuté, dispensé, ou indemnisé.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'SOLDE',
                libelle: 'Solde de tout compte, certificat de travail, attestation',
                attendu: "Les trois pièces sont dues à la remise. Le décompte proposé par l'application reste un projet à vérifier.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'DECLARATION',
                libelle: 'Déclaration de la rupture aux organismes',
                attendu: "Sortie déclarée à la CNPS, et à l'inspection du travail quand la nature de la rupture l'exige.",
                obligatoire: true,
                delaiMinJours: 0
            }
        ]
    },

    SANCTION: {
        libelle: 'Sanction disciplinaire',
        avertissement:
            "Une sanction prononcée sans avoir recueilli les explications du salarié " +
            "se conteste sur la forme, indépendamment des faits reprochés.",
        etapes: [
            {
                code: 'EXPLICATION',
                libelle: 'Demande d\'explication écrite',
                attendu: "Énoncer les faits, leur date et leur lieu. Remettre contre décharge.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'REPONSE',
                libelle: 'Réponse du salarié',
                attendu: "Consigner la réponse, ou l'absence de réponse à l'échéance.",
                obligatoire: true,
                delaiMinJours: DELAI_EXPLICATION,
                motifDelai: "Le salarié doit disposer du temps de s'expliquer."
            },
            {
                code: 'DECISION',
                libelle: 'Notification écrite et motivée de la sanction',
                attendu: "Le motif et la sanction retenue figurent dans l'écrit.",
                obligatoire: true,
                delaiMinJours: 0,
                delaiMaxJours: DELAI_NOTIFICATION
            },
            {
                code: 'CLASSEMENT',
                libelle: 'Classement au dossier du salarié',
                attendu: "La sanction est versée au dossier disciplinaire, où elle sera opposable.",
                obligatoire: false,
                delaiMinJours: 0
            }
        ]
    },

    RUPTURE_ESSAI: {
        libelle: "Rupture pendant la période d'essai",
        avertissement:
            "La rupture doit intervenir avant le terme de l'essai. Une rupture notifiée " +
            "après ce terme est un licenciement, avec la procédure qui lui correspond.",
        etapes: [
            {
                code: 'VERIF_ESSAI',
                libelle: "Vérification de la date de fin d'essai",
                attendu: "Confronter la date du contrat à celle de la notification envisagée.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'NOTIFICATION',
                libelle: 'Notification écrite de la rupture',
                attendu: "Remise contre décharge ou lettre recommandée.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'SOLDE',
                libelle: 'Solde de tout compte et pièces de fin de contrat',
                attendu: "Certificat de travail et attestation dus comme pour toute rupture.",
                obligatoire: true,
                delaiMinJours: 0
            }
        ]
    },

    DEMISSION: {
        libelle: 'Démission',
        avertissement:
            "La démission doit être écrite et non équivoque. Une démission recueillie " +
            "sous pression se requalifie en licenciement.",
        etapes: [
            {
                code: 'ECRIT',
                libelle: 'Réception de la démission écrite',
                attendu: "Conserver l'écrit du salarié et sa date de réception.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'PREAVIS',
                libelle: 'Préavis exécuté ou dispensé',
                attendu: "Consigner la position de l'employeur sur le préavis.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'SOLDE',
                libelle: 'Solde de tout compte et pièces de fin de contrat',
                attendu: "Certificat de travail et attestation dus comme pour toute rupture.",
                obligatoire: true,
                delaiMinJours: 0
            },
            {
                code: 'DECLARATION',
                libelle: 'Déclaration de la sortie aux organismes',
                attendu: "Sortie déclarée à la CNPS.",
                obligatoire: true,
                delaiMinJours: 0
            }
        ]
    }
};

const TYPES = Object.keys(MODELES);

module.exports = {
    MODELES, TYPES,
    DELAI_ENTRETIEN, DELAI_EXPLICATION, DELAI_NOTIFICATION
};
