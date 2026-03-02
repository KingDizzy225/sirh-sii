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

// --- Gestion des utilisateurs par l'Admin ---

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
};

