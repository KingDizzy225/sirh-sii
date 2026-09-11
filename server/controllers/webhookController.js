const prisma = require('../prismaClient');
const evenements = require('../lib/evenements');

/**
 * Webhooks sortants : enregistrement et consultation.
 *
 * L'émission vit dans lib/evenements.js. Ce contrôleur ne laisse plus
 * enregistrer qu'un événement réellement émis, et ne renvoie plus le secret
 * au navigateur : un secret affiché à chaque ouverture de l'écran n'en est plus un.
 */

const pourEcran = (w) => {
    // eslint-disable-next-line no-unused-vars
    const { secret, ...visible } = w;
    return {
        ...visible,
        securise: Boolean(secret),
        // Un webhook enregistré avant le catalogue peut viser un événement que
        // l'application n'émet pas : l'écran doit le dire.
        emis: evenements.typesAcceptes().has(w.eventType)
    };
};

exports.getWebhooks = async (req, res) => {
    try {
        const webhooks = await prisma.webhookEndpoint.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(webhooks.map(pourEcran));
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
};

/** GET /api/webhooks/evenements — les événements que l'application émet vraiment. */
exports.getCatalogue = (req, res) => {
    res.json(Object.entries(evenements.CATALOGUE).map(([type, d]) => ({ type, libelle: d.libelle })));
};

exports.createWebhook = async (req, res) => {
    try {
        const { name, url, eventType, secret } = req.body || {};

        if (!String(name || '').trim()) {
            return res.status(400).json({ error: 'Nom du webhook requis.' });
        }
        if (!evenements.typesAcceptes().has(eventType)) {
            return res.status(400).json({
                error: `Événement inconnu : ${eventType || '(aucun)'}. Seuls les événements réellement émis peuvent être suivis.`,
                catalogue: Object.keys(evenements.CATALOGUE)
            });
        }

        let adresse;
        try {
            adresse = new URL(String(url || ''));
        } catch {
            return res.status(400).json({ error: 'Adresse de destination invalide.' });
        }
        // Les événements portent des noms de salariés : ils ne circulent pas en clair.
        const locale = ['localhost', '127.0.0.1'].includes(adresse.hostname);
        if (adresse.protocol !== 'https:' && !locale) {
            return res.status(400).json({ error: "L'adresse doit être en https : les événements transportent des noms de salariés." });
        }

        const newWebhook = await prisma.webhookEndpoint.create({
            data: {
                name: String(name).trim(),
                url: adresse.toString(),
                eventType,
                secret: secret ? String(secret) : null
            }
        });
        res.status(201).json(pourEcran(newWebhook));
    } catch (error) {
        console.error('Error creating webhook:', error);
        res.status(500).json({ error: 'Failed to create webhook' });
    }
};

exports.deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.webhookEndpoint.delete({ where: { id } });
        res.status(200).json({ message: 'Webhook deleted successfully' });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
};

/**
 * Conservé pour les appelants existants. Il envoyait le secret en clair,
 * journalisait comme réussi un envoi refusé, et transmettait la fiche entière.
 */
exports.triggerWebhook = (eventType, payload) => evenements.emettreSansAttendre(eventType, payload);
