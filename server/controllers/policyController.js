/**
 * Règles internes de l'entreprise.
 *
 * Elles alimentent l'assistant RH, qui portait jusqu'ici un contexte figé dans
 * son prompt et répondait donc les mêmes règles à toute entreprise. Ancrer ses
 * réponses sur des textes saisis par la RH, et lui faire citer celui qu'il
 * utilise, rend chaque réponse vérifiable — condition pour qu'un salarié puisse
 * s'y fier sur un droit à congés ou une retenue.
 */

const prisma = require('../prismaClient');
const { getGenerativeModel } = require('../lib/claudeAI');

const CATEGORIES = ['Congés', 'Horaires', 'Rémunération', 'Discipline', 'Santé', 'Autre'];

const presenter = (r) => ({
    id: r.id,
    titre: r.title,
    categorie: r.category,
    contenu: r.content,
    source: r.source,
    active: r.active,
    misAJourPar: r.updatedBy,
    misAJourLe: r.updatedAt
});

/**
 * Règles actives, mises en forme pour être injectées dans les consignes de
 * l'assistant. Exportée pour que le chatbot n'ait pas à refaire la requête.
 */
async function reglesPourAssistant() {
    const regles = await prisma.policyRule.findMany({
        where: { active: true },
        orderBy: [{ category: 'asc' }, { title: 'asc' }]
    });
    return regles.map(r => ({
        titre: r.title,
        categorie: r.category,
        contenu: r.content,
        source: r.source || r.title
    }));
}

/** GET /api/policies */
exports.getPolicies = async (req, res) => {
    try {
        const regles = await prisma.policyRule.findMany({
            orderBy: [{ category: 'asc' }, { title: 'asc' }]
        });
        res.json({
            regles: regles.map(presenter),
            categories: CATEGORIES,
            actives: regles.filter(r => r.active).length
        });
    } catch (error) {
        console.error('Erreur lecture des règles internes :', error);
        res.status(500).json({ error: 'Erreur lors du chargement des règles internes.' });
    }
};

/** POST /api/policies */
exports.createPolicy = async (req, res) => {
    try {
        const { titre, categorie, contenu, source, active } = req.body;

        const manquants = [];
        if (!titre || !String(titre).trim()) manquants.push('titre');
        if (!contenu || !String(contenu).trim()) manquants.push('contenu');
        if (manquants.length > 0) {
            return res.status(400).json({ error: `Champ(s) obligatoire(s) manquant(s) : ${manquants.join(', ')}.` });
        }
        if (categorie && !CATEGORIES.includes(categorie)) {
            return res.status(400).json({ error: `Catégorie « ${categorie} » inconnue. Valeurs : ${CATEGORIES.join(', ')}.` });
        }

        const regle = await prisma.policyRule.create({
            data: {
                title: String(titre).trim(),
                category: categorie || 'Autre',
                content: String(contenu).trim(),
                source: source ? String(source).trim() : null,
                active: active !== false,
                updatedBy: req.user?.name || req.user?.email || null
            }
        });
        res.status(201).json(presenter(regle));
    } catch (error) {
        console.error('Erreur création de règle :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de la règle." });
    }
};

/** PUT /api/policies/:id */
exports.updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, categorie, contenu, source, active } = req.body;

        const existante = await prisma.policyRule.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Règle introuvable.' });

        if (titre !== undefined && !String(titre).trim()) {
            return res.status(400).json({ error: 'Le titre ne peut pas être vide.' });
        }
        if (contenu !== undefined && !String(contenu).trim()) {
            return res.status(400).json({ error: 'Le contenu ne peut pas être vide.' });
        }
        if (categorie !== undefined && !CATEGORIES.includes(categorie)) {
            return res.status(400).json({ error: `Catégorie « ${categorie} » inconnue.` });
        }

        const data = { updatedBy: req.user?.name || req.user?.email || null };
        if (titre !== undefined) data.title = String(titre).trim();
        if (categorie !== undefined) data.category = categorie;
        if (contenu !== undefined) data.content = String(contenu).trim();
        if (source !== undefined) data.source = source ? String(source).trim() : null;
        if (active !== undefined) data.active = active === true;

        const misAJour = await prisma.policyRule.update({ where: { id }, data });
        res.json(presenter(misAJour));
    } catch (error) {
        console.error('Erreur mise à jour de règle :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la règle.' });
    }
};

/** DELETE /api/policies/:id */
exports.deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const existante = await prisma.policyRule.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Règle introuvable.' });
        await prisma.policyRule.delete({ where: { id } });
        res.json({ message: 'Règle supprimée.' });
    } catch (error) {
        console.error('Erreur suppression de règle :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la règle.' });
    }
};

/**
 * POST /api/policies/proposer
 *
 * Lit un règlement intérieur ou une note de service et en propose un découpage
 * en règles. **Rien n'est enregistré** : la proposition revient à l'écran pour
 * relecture. Une règle interne engage l'entreprise vis-à-vis de ses salariés ;
 * elle ne doit pas entrer en base parce qu'un modèle l'a extraite d'un PDF.
 */
exports.proposerDepuisDocument = async (req, res) => {
    try {
        const { texte, fichierBase64, typeMime } = req.body;

        if (!texte && !fichierBase64) {
            return res.status(400).json({ error: 'Fournir un texte ou un document à analyser.' });
        }

        const consignes = `Tu assistes un service RH ivoirien qui structure ses textes internes.

On te transmet un règlement intérieur, une note de service ou un extrait de
convention collective. Découpe-le en règles autonomes, chacune compréhensible
seule.

Règles de travail :
- N'invente rien. Ne reformule pas au point de changer le sens. Si une
  disposition est ambiguë, reprends-la telle quelle plutôt que de l'interpréter.
- Ignore les passages qui n'énoncent aucune règle (préambules, formules de
  politesse, signatures).
- Cite dans "source" l'article ou le paragraphe d'origine quand il est
  identifiable, sinon laisse la chaîne vide.

Réponds UNIQUEMENT par un tableau JSON, sans texte autour :
[
  {
    "titre": "Intitulé court de la règle",
    "categorie": "Congés" | "Horaires" | "Rémunération" | "Discipline" | "Santé" | "Autre",
    "contenu": "Énoncé de la règle, fidèle au texte",
    "source": "Règlement intérieur, art. 12"
  }
]`;

        const modele = getGenerativeModel({ systemInstruction: consignes });

        const entree = fichierBase64
            ? [{ inlineData: { data: fichierBase64, mimeType: typeMime || 'application/pdf' } },
               'Découpe ce document en règles internes.']
            : `Découpe ce texte en règles internes :\n\n"""\n${texte}\n"""`;

        const resultat = await modele.generateContent(entree);
        const brut = (await resultat.response.text()).trim()
            .replace(/^```json/i, '').replace(/```$/, '').trim();

        let propositions;
        try {
            propositions = JSON.parse(brut);
        } catch {
            return res.status(502).json({
                error: "La lecture du document n'a pas produit un résultat exploitable. Réessayez, ou saisissez les règles à la main."
            });
        }
        if (!Array.isArray(propositions)) {
            return res.status(502).json({ error: 'Résultat inattendu : un tableau de règles était attendu.' });
        }

        // Les catégories inconnues retombent sur « Autre » plutôt que d'être
        // refusées : une proposition mal étiquetée reste utile à relire.
        const nettoyees = propositions
            .filter(p => p && p.titre && p.contenu)
            .map(p => ({
                titre: String(p.titre).trim(),
                categorie: CATEGORIES.includes(p.categorie) ? p.categorie : 'Autre',
                contenu: String(p.contenu).trim(),
                source: p.source ? String(p.source).trim() : null
            }));

        res.json({
            propositions: nettoyees,
            avertissement: "Propositions non enregistrées : relisez chaque règle avant de la valider."
        });
    } catch (error) {
        console.error('Erreur proposition de règles :', error);
        res.status(500).json({
            error: error.message?.includes('ANTHROPIC_API_KEY')
                ? "Fonction indisponible : la clé Anthropic n'est pas configurée sur le serveur."
                : "Erreur lors de l'analyse du document."
        });
    }
};

module.exports.reglesPourAssistant = reglesPourAssistant;
module.exports.CATEGORIES = CATEGORIES;
