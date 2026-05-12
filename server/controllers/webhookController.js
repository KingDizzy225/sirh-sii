const prisma = require('../prismaClient');

exports.getWebhooks = async (req, res) => {
    try {
        const webhooks = await prisma.webhookEndpoint.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(webhooks);
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
};

exports.createWebhook = async (req, res) => {
    try {
        const { name, url, eventType, secret } = req.body;
        const newWebhook = await prisma.webhookEndpoint.create({
            data: { name, url, eventType, secret }
        });
        res.status(201).json(newWebhook);
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

// Helper function to trigger a webhook (used internally by other controllers)
exports.triggerWebhook = async (eventType, payload) => {
    try {
        const endpoints = await prisma.webhookEndpoint.findMany({
            where: { eventType, isActive: true }
        });

        if (endpoints.length === 0) return;

        // In a real production system, this should be sent to a background job queue (RabbitMQ/Bull)
        endpoints.forEach(async (endpoint) => {
            try {
                // Here we use fetch or axios to send the POST request
                await fetch(endpoint.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Secret': endpoint.secret || ''
                    },
                    body: JSON.stringify({
                        event: eventType,
                        timestamp: new Date().toISOString(),
                        data: payload
                    })
                });
                console.log(`[WEBHOOK SUCCESS] Sent ${eventType} to ${endpoint.url}`);
            } catch (err) {
                console.error(`[WEBHOOK ERROR] Failed to send ${eventType} to ${endpoint.url}`, err);
            }
        });
    } catch (error) {
        console.error('Error in triggerWebhook:', error);
    }
};
