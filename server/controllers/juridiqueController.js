const { getGenerativeModel } = require('../lib/claudeAI');
const juridiqueCI = require('../lib/juridiqueCI');
const prisma = require('../prismaClient');

/**
 * Consultation juridique instantanée avec Claude spécialisé en droit ivoirien.
 */
exports.consulter = async (req, res) => {
    try {
        const { question, historique = [] } = req.body || {};
        if (!question || String(question).trim().length < 5) {
            return res.status(400).json({ error: 'Veuillez poser une question juridique claire (au moins 5 caractères).' });
        }

        const model = getGenerativeModel({
            systemInstruction: juridiqueCI.SYSTEM_PROMPT_JURIDIQUE
        });

        if (!model) {
            return res.status(503).json({ error: "L'assistant juridique n'est pas disponible pour l'instant (clé d'IA non configurée)." });
        }

        const contexteHistorique = (historique || []).slice(-6).map((h) => `${h.role === 'user' ? 'Question RH' : 'Réponse Juriste'}: ${h.content}`).join('\n\n');
        const invite = `${contexteHistorique ? `Historique récent de l'échange :\n${contexteHistorique}\n\n` : ''}Nouvelle question RH :\n${question.trim()}\n\nFournis une analyse juridique complète et précise selon le droit du travail de Côte d'Ivoire. Structure ta réponse avec :
1. Les règles et articles de loi / CCNI applicables.
2. L'analyse de la situation.
3. Les démarches et formalités obligatoires (délais, courriers, preuves).
4. Les précautions recommandées pour l'employeur.`;

        const result = await model.generateContent(invite);
        const reponse = result.response.text();

        res.json({
            reponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[JURIDIQUE] Erreur lors de la consultation :', error.message);
        res.status(500).json({ error: `Erreur lors de la consultation juridique : ${error.message}` });
    }
};

/**
 * Générateur de courriers pré-contentieux et actes juridiques conformes au droit ivoirien.
 */
exports.genererCourrier = async (req, res) => {
    try {
        const { typeActe, nomSalarie, poste, dateFaits, motifs, sanctions, dateEntretien, employeeId } = req.body || {};

        let salarieInfo = { nom: nomSalarie || 'M./Mme [Nom du salarié]', poste: poste || '[Fonction]' };
        if (employeeId) {
            const emp = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { firstName: true, lastName: true, positionTitle: true, department: true, matricule: true }
            });
            if (emp) {
                salarieInfo = {
                    nom: `${emp.firstName} ${emp.lastName}`,
                    poste: emp.positionTitle || emp.department || 'Salarié',
                    matricule: emp.matricule
                };
            }
        }

        const model = getGenerativeModel({
            systemInstruction: juridiqueCI.SYSTEM_PROMPT_JURIDIQUE
        });

        if (!model) {
            return res.status(503).json({ error: "L'IA n'est pas disponible pour générer l'acte." });
        }

        const prompt = `Rédige un acte juridique officiel et complet en français conforme aux règles du droit du travail ivoirien :
Type d'acte : ${typeActe || "Demande d'explications écrites"}
Destinataire : ${salarieInfo.nom} (${salarieInfo.poste}${salarieInfo.matricule ? `, Matricule ${salarieInfo.matricule}` : ''})
Date des faits / événement : ${dateFaits || 'Date récente'}
Motifs et circonstances détaillées : ${motifs || 'Faits reprochés constatés'}
Date d'entretien (si applicable) : ${dateEntretien || 'À déterminer'}
Décision ou sanction envisagée : ${sanctions || 'À apprécier après retour des explications'}

Instructions de rédaction :
- Rédige le document complet avec en-tête (Société d'Informatique et d'Ingénierie - SII CI, Partenaire Orange Côte d'Ivoire), date, objet clair, formules de politesse protocolaires.
- Mentionne explicitement les délais légaux de réponse (ex: 48 heures pour explications écrites).
- Mentionne les articles pertinents du Code du travail et du règlement intérieur.
- Inclus la mention pour décharge ou accusé de réception par le salarié.
- Rends uniquement le texte complet du courrier prêt à imprimer.`;

        const result = await model.generateContent(prompt);
        const documentTexte = result.response.text();

        res.json({
            document: documentTexte,
            salarie: salarieInfo,
            dateGeneration: new Date().toISOString()
        });
    } catch (error) {
        console.error('[JURIDIQUE] Erreur génération courrier :', error.message);
        res.status(500).json({ error: `Erreur lors de la génération de l'acte : ${error.message}` });
    }
};

/**
 * Calculateur de barème légal (indemnités de licenciement et préavis selon CCNI).
 */
exports.calculerBareme = (req, res) => {
    try {
        const { salaireMoyenMensuel, ancienneteAnnees, categorie } = req.body || {};
        const indemnites = juridiqueCI.calculerIndemniteLicenciement(salaireMoyenMensuel, ancienneteAnnees);
        const preavis = juridiqueCI.calculerPreavis(categorie, ancienneteAnnees);

        res.json({
            indemnites,
            preavis,
            recapitulatif: {
                salaireReference: indemnites.salaireMoyen,
                anciennete: indemnites.anciennete,
                montantIndemniteLicenciement: indemnites.total,
                dureePreavisMois: preavis.mois,
                indemnitePreavisEstimee: Math.round(preavis.mois * (Number(salaireMoyenMensuel) || 0))
            }
        });
    } catch (error) {
        console.error('[JURIDIQUE] Erreur calcul barème :', error.message);
        res.status(400).json({ error: error.message });
    }
};
