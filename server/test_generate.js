const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

async function testGeneration() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'admin@sirh.com' } });
        if (!user) return console.log('Admin user not found');
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'super-secret-sirh-key-2026',
            { expiresIn: '1h' }
        );

        // Dummy transparent 1x1 png base64
        const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
        const res = await fetch('http://localhost:3000/api/documents/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type: 'Attestation',
                signatureDataUrl: dummyBase64
            })
        });

        console.log('STATUS:', res.status);
        const text = await res.text();
        console.log('RESPONSE:', text);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testGeneration().finally(() => prisma.$disconnect());
