const fichePoste = require('../lib/fichePoste');
const apposition = require('../lib/apposition');
const { getGenerativeModel, MODEL } = require("../lib/claudeAI");
const prisma = require('../prismaClient');
const aiModel = getGenerativeModel();

exports.getJobDescriptions = async (req, res) => {
    try {
        const jobs = await prisma.jobDescription.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getJobDescriptionById = async (req, res) => {
    try {
        const job = await prisma.jobDescription.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ error: "Introuvable" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.generateJobDescription = async (req, res) => {
    try {
        const { title, department } = req.body;

        const systemPrompt = `Tu es un Expert RH spécialisé dans la rédaction de fiches de poste modernes et attractives pour l'entreprise ivoirienne SII.
Rédige une fiche de poste complète et structurée au format HTML (uniquement le corps, sans les balises <html>, <head> ou <body>).
Le poste est : "${title}" dans le département : "${department}".

La structure attendue DOIT être exactement la suivante, avec de belles balises HTML (h2, h3, ul, li, p, strong) :
<h2>Description du Poste : ${title}</h2>
<p>[Une brève introduction accrocheuse]</p>

<h3>🎯 Vos Missions Principales</h3>
<ul>
  <li>[Mission 1]</li>
  ...
</ul>

<h3>🧠 Compétences Requises (Hard Skills)</h3>
<ul>...</ul>

<h3>🤝 Savoir-Être (Soft Skills)</h3>
<ul>...</ul>

<h3>💰 Rémunération & Avantages</h3>
<p>Salaire estimé sur le marché (en FCFA) : [Fourchette réaliste]</p>
<ul>
  <li>Assurance Santé à 80%</li>
  ...
</ul>

Réponds UNIQUEMENT par le code HTML généré. Aucun autre texte.`;

        let htmlContent = "";
        try {
            console.log(`[AI-GEN] Request for ${title} in ${department} using ${MODEL}`);
            const result = await aiModel.generateContent(systemPrompt);
            const response = await result.response;
            htmlContent = response.text().trim();
            console.log(`[AI-GEN] Raw Response length: ${htmlContent.length}`);
            
            // Better cleaning of AI response (remove markdown code blocks)
            htmlContent = htmlContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');
            console.log(`[AI-GEN] Cleaned Content length: ${htmlContent.length}`);
        } catch (aiError) {
            console.error("[AI-GEN] Critical AI Error, switching to fallback:", aiError.message);
        }

        if (!htmlContent || htmlContent.length < 50) {
            console.warn("[AI-GEN] Using fallback content (AI failed or returned empty).");
            htmlContent = `
                <div class="job-description">
                    <h2>🎯 Poste : ${title}</h2>
                    <p>Nous recherchons un(e) <strong>${title}</strong> talentueux(se) pour rejoindre notre département <strong>${department}</strong> au sein de S.I.I Entreprise.</p>
                    
                    <h3>📋 Vos Missions Principales</h3>
                    <ul>
                        <li>Assurer l'excellence opérationnelle dans les missions confiées.</li>
                        <li>Collaborer avec les équipes transverses pour atteindre les objectifs du département.</li>
                        <li>Participer à l'amélioration continue des processus internes.</li>
                    </ul>

                    <h3>Compétences Requises</h3>
                    <ul>
                        <li>Expertise métier dans le domaine du poste.</li>
                        <li>Capacité d'analyse et de synthèse.</li>
                        <li>Esprit d'équipe et excellentes capacités de communication.</li>
                    </ul>

                    <p><i>[Note: La génération automatique par IA est temporairement indisponible (quota atteint). Cette fiche est un modèle standard à compléter.]</i></p>
                </div>
            `;
        }

        const job = await prisma.jobDescription.create({
            data: {
                title,
                department,
                content: htmlContent
            }
        });

        res.status(201).json(job);

    } catch (error) {
        console.error("Critical Job Generation Error:", error);
        res.status(500).json({ error: "Erreur serveur lors de la création de la fiche" });
    }
};

exports.updateJobDescription = async (req, res) => {
    try {
        const { content, status } = req.body;
        const job = await prisma.jobDescription.update({
            where: { id: req.params.id },
            data: { content, status }
        });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteJobDescription = async (req, res) => {
    try {
        await prisma.jobDescription.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// ----------------------------------------------------
// Fiche de poste — trame de l'entreprise
// ----------------------------------------------------

const RUBRIQUES_LISTE = ['taches', 'moyensTechniques', 'savoir', 'savoirFaire', 'savoirEtre', 'risquesPoste', 'risquesMateriel'];

/** Normalise les rubriques en listes, qu'elles arrivent en tableau ou en texte. */
const normaliser = (corps) => {
    const donnees = {};
    for (const cle of RUBRIQUES_LISTE) {
        if (corps[cle] !== undefined) donnees[cle] = fichePoste.enListe(corps[cle]);
    }
    for (const cle of [
        'title', 'department', 'salarieNom', 'direction', 'lieu', 'categorie',
        'superieurHierarchique', 'mission', 'relationsInterne', 'relationsExterne',
        'rapportsDestinataires', 'rapportsFrequences', 'formation'
    ]) {
        if (corps[cle] !== undefined) donnees[cle] = corps[cle] ? String(corps[cle]).trim() : null;
    }
    if (corps.employeeId !== undefined) donnees.employeeId = corps.employeeId || null;
    if (corps.dateDebut !== undefined) {
        const d = corps.dateDebut ? new Date(corps.dateDebut) : null;
        donnees.dateDebut = d && !isNaN(d.getTime()) ? d : null;
    }
    return donnees;
};

/**
 * Propose une fiche de poste renseignée, sans l'enregistrer.
 *
 * Une fiche de poste est remise au salarié et lui est opposable : elle ne doit
 * pas entrer en base parce qu'un modèle l'a rédigée. La RH relit, corrige, puis
 * enregistre.
 */
exports.proposerFiche = async (req, res) => {
    try {
        const { title, department, superieurHierarchique, lieu, categorie } = req.body;
        if (!title) return res.status(400).json({ error: 'Intitulé du poste requis.' });

        const consignes = `Tu rédiges une fiche de poste pour une entreprise ivoirienne de distribution.
Réponds par un objet JSON strict, sans balise de code, avec exactement ces clés :
{
  "mission": "un paragraphe décrivant le rattachement et la mission principale",
  "taches": ["..."],
  "relationsInterne": "les interlocuteurs internes",
  "relationsExterne": "les interlocuteurs externes",
  "rapportsDestinataires": "à qui le titulaire rend compte",
  "rapportsFrequences": "à quelle fréquence",
  "moyensTechniques": ["..."],
  "savoir": ["connaissances théoriques"],
  "savoirFaire": ["compétences pratiques et outils"],
  "savoirEtre": ["qualités personnelles"],
  "formation": "niveau de diplôme et expérience attendus",
  "risquesPoste": ["conséquences pour l'entreprise si le poste est mal tenu"],
  "risquesMateriel": ["conséquences si le matériel confié est mal tenu"]
}
Écris en français, au style sobre des documents administratifs, sans emoji ni superlatif.
Chaque liste comporte entre 4 et 12 éléments, formulés à l'infinitif pour les tâches.`;

        const requete = `Poste : ${title}
Direction ou département : ${department || 'non précisé'}
Supérieur hiérarchique : ${superieurHierarchique || 'non précisé'}
Lieu : ${lieu || 'non précisé'}
Catégorie : ${categorie || 'non précisée'}`;

        const modele = getGenerativeModel({
            systemInstruction: consignes,
            generationConfig: { responseMimeType: 'application/json' }
        });
        const resultat = await modele.generateContent(requete);
        const texte = (await resultat.response.text()).trim()
            .replace(/^```json\n?/, '').replace(/\n?```$/, '');

        let proposition;
        try {
            proposition = JSON.parse(texte);
        } catch {
            return res.status(502).json({
                error: "La réponse du modèle n'est pas exploitable. Réessayer, ou remplir la fiche à la main."
            });
        }

        res.json({
            proposition: normaliser({ ...proposition, title, department }),
            // Rien n'est enregistré : le dire évite qu'on croie la fiche créée.
            enregistree: false,
            avertissement: "Proposition non enregistrée. Relisez chaque rubrique : cette fiche sera remise au salarié."
        });
    } catch (error) {
        console.error('Erreur proposition de fiche de poste :', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la proposition.' });
    }
};

/** Crée ou met à jour une fiche de poste structurée. */
exports.enregistrerFiche = async (req, res) => {
    try {
        const { id } = req.params;
        const donnees = normaliser(req.body);

        if (!donnees.title) return res.status(400).json({ error: 'Intitulé du poste requis.' });
        if (!donnees.department) donnees.department = req.body.direction || 'Non précisé';

        if (donnees.employeeId) {
            const salarie = await prisma.employee.findUnique({ where: { id: donnees.employeeId } });
            if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });
            // Le nom porté sur la fiche est celui du salarié rattaché : le
            // laisser saisir séparément ouvrirait la porte à une divergence.
            donnees.salarieNom = `${salarie.lastName} ${salarie.firstName}`.trim();
        }

        const fiche = id
            ? await prisma.jobDescription.update({ where: { id }, data: donnees })
            : await prisma.jobDescription.create({ data: { ...donnees, content: '' } });

        res.status(id ? 200 : 201).json(fiche);
    } catch (error) {
        console.error('Erreur enregistrement de fiche de poste :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de la fiche." });
    }
};

/**
 * Produit la fiche de poste en PDF.
 *
 * Les visas demandés portent la signature d'un signataire enregistré ; les
 * autres restent vierges pour une signature manuscrite. Une fiche partiellement
 * signée est une situation normale — les trois visas ne sont pas toujours
 * apposés le même jour.
 */
exports.telechargerFiche = async (req, res) => {
    try {
        const fiche = await prisma.jobDescription.findUnique({
            where: { id: req.params.id },
            include: { employee: { select: { firstName: true, lastName: true, positionTitle: true } } }
        });
        if (!fiche) return res.status(404).json({ error: 'Fiche introuvable.' });

        // visas attendus sous la forme DE=<signataireId>,DRH=<signataireId>
        const demandes = {};
        for (const paire of String(req.query.visas || '').split(',')) {
            const [code, signataireId] = paire.split('=');
            if (code && signataireId) demandes[code.trim().toUpperCase()] = signataireId.trim();
        }

        const visas = [];
        for (const v of fichePoste.VISAS) {
            const signataireId = demandes[v.code];
            if (!signataireId) continue;
            const signataire = await apposition.choisirSignataire(signataireId);
            if (!signataire) continue;
            visas.push({
                code: v.code,
                nom: signataire.nom,
                fonction: signataire.fonction,
                image: apposition.imageDepuisDataUrl(signataire.signatureImage)
            });
        }

        const doc = fichePoste.nouvelleFiche({
            ...fiche,
            salarieNom: fiche.salarieNom ||
                (fiche.employee ? `${fiche.employee.lastName} ${fiche.employee.firstName}` : ''),
            visas
        });

        const nom = `fiche_de_poste_${String(fiche.title).replace(/\s+/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nom}`);
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Erreur production de la fiche de poste :', error);
        if (!res.headersSent) res.status(500).json({ error: 'Erreur lors de la production de la fiche.' });
    }
};
