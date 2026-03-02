const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clé secrète JWT (À mettre idéalement dans .env)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-sirh-key-2026';

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // 2. Vérifier le mot de passe hashé
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // 3. Créer le jeton (Token) JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '8h' } // Expire après 8 heures (1 journée de travail)
        );

        // On ne renvoie pas le mot de passe dans la réponse
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur Serveur lors de la connexion' });
    }
};

exports.getProfile = async (req, res) => {
    // Cette route sera protégée par le middleware, donc req.user existera
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        res.status(500).json({ error: 'Erreur de récupération de profil' });
    }
};

exports.updateCredentials = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 1. Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // 2. Vérifier le mot de passe actuel
        if (!currentPassword) {
            return res.status(400).json({ error: 'Mot de passe actuel requis' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Le mot de passe actuel est incorrect' });
        }

        // 3. Préparer les données de mise à jour
        const updateData = {};
        if (email && email.trim() !== '') {
            updateData.email = email.trim();
        }
        if (newPassword && newPassword.trim() !== '') {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // 4. Mettre à jour en base de données
        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: updateData
            });
        }

        res.status(200).json({ message: 'Identifiants mis à jour avec succès' });
    } catch (error) {
        console.error('Update credentials error:', error);
        res.status(500).json({ error: 'Erreur Serveur lors de la mise à jour' });
    }
};

