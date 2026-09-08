const prisma = require('../prismaClient');

// Get today's time logs for the logged-in employee
exports.getTodayLogs = async (req, res) => {
    try {
        const email = req.user.email;
        const employee = await prisma.employee.findUnique({ where: { email } });
        
        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const logs = await prisma.timeLog.findMany({
            where: {
                employeeId: employee.id,
                timestamp: { gte: startOfDay }
            },
            orderBy: { timestamp: 'asc' }
        });

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching today's time logs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Distance en mètres entre deux points GPS (formule de haversine)
const haversineMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // rayon terrestre en mètres
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Log a time entry (Clock In or Clock Out)
exports.logTime = async (req, res) => {
    try {
        const { type, latitude, longitude, accuracy, horodatageLocal, clientRef } = req.body; // 'CLOCK_IN' or 'CLOCK_OUT'
        if (!['CLOCK_IN', 'CLOCK_OUT'].includes(type)) {
            return res.status(400).json({ error: "Type de pointage invalide" });
        }

        /**
         * Pointage différé : hors connexion, l'appareil conserve l'heure réelle
         * et la transmet au retour du réseau. C'est cette heure qui fait foi.
         *
         * Une heure fournie par le client étant falsifiable, elle est bornée :
         * jamais dans le futur, jamais au-delà de sept jours en arrière. Un
         * horodatage hors de ces bornes est ignoré au profit de l'heure serveur,
         * plutôt que rejeté — perdre le pointage pénaliserait le salarié.
         */
        let timestamp = undefined;
        if (horodatageLocal) {
            const propose = new Date(horodatageLocal);
            const maintenant = new Date();
            const septJours = 7 * 24 * 3600 * 1000;
            const valide = !isNaN(propose.getTime()) &&
                propose <= maintenant &&
                (maintenant - propose) <= septJours;
            if (valide) {
                timestamp = propose;
            } else {
                console.warn('[POINTAGE] Horodatage différé hors bornes, heure serveur retenue :', horodatageLocal);
            }
        }

        const email = req.user.email;
        const employee = await prisma.employee.findUnique({ where: { email } });

        if (!employee) return res.status(404).json({ error: "Employé introuvable" });

        /**
         * Renvoi d'un pointage déjà enregistré.
         *
         * L'appareil renvoie ce qu'il croit non transmis. Une réponse perdue en
         * route — liaison de chantier — lui fait rejouer une requête que le
         * serveur a pourtant traitée. On rend alors le pointage existant plutôt
         * que d'en créer un second : c'est un doublon d'envoi, pas un doublon de
         * présence.
         *
         * La référence est rattachée au salarié qui l'a produite : un appareil
         * partagé ne doit pas pouvoir faire porter à l'un le pointage de
         * l'autre en rejouant sa référence.
         */
        if (clientRef) {
            const existant = await prisma.timeLog.findUnique({
                where: { clientRef: String(clientRef) },
                include: { workSite: { select: { name: true } } }
            });
            if (existant) {
                if (existant.employeeId !== employee.id) {
                    return res.status(409).json({
                        error: "Cette référence de pointage appartient à un autre salarié."
                    });
                }
                return res.status(200).json({ ...existant, deja: true, locationStatus: null });
            }
        }

        const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';

        // Vérification du périmètre par rapport aux sites de travail actifs.
        // Le pointage n'est jamais bloqué (GPS refusé ou imprécis) : il est
        // enregistré avec son statut pour que la RH puisse contrôler a posteriori.
        let geoData = {};
        let locationStatus = 'NO_SITES'; // aucun site configuré => pas de contrôle
        const sites = await prisma.workSite.findMany({ where: { isActive: true } });

        if (hasCoords) {
            geoData = {
                latitude,
                longitude,
                accuracy: typeof accuracy === 'number' ? accuracy : null
            };
            if (sites.length > 0) {
                let nearest = null;
                for (const site of sites) {
                    const d = haversineMeters(latitude, longitude, site.latitude, site.longitude);
                    if (!nearest || d < nearest.distance) nearest = { site, distance: d };
                }
                geoData.workSiteId = nearest.site.id;
                geoData.distanceMeters = nearest.distance;
                geoData.withinPerimeter = nearest.distance <= nearest.site.radiusMeters;
                locationStatus = geoData.withinPerimeter ? 'ON_SITE' : 'OFF_SITE';
            } else {
                locationStatus = 'NO_SITES';
            }
        } else if (sites.length > 0) {
            locationStatus = 'NO_GPS'; // sites configurés mais position non transmise
        }

        let newLog;
        try {
            newLog = await prisma.timeLog.create({
                data: {
                    employeeId: employee.id,
                    type: type,
                    ...(clientRef ? { clientRef: String(clientRef) } : {}),
                    ...(timestamp ? { timestamp } : {}),
                    ...geoData
                },
                include: { workSite: { select: { name: true } } }
            });
        } catch (erreur) {
            // Deux envois simultanés de la même référence : le second perd la
            // course à l'insertion. Il n'a rien à créer, seulement à retrouver.
            if (erreur.code === 'P2002' && clientRef) {
                const existant = await prisma.timeLog.findUnique({
                    where: { clientRef: String(clientRef) },
                    include: { workSite: { select: { name: true } } }
                });
                if (existant) return res.status(200).json({ ...existant, deja: true, locationStatus: null });
            }
            throw erreur;
        }

        res.status(201).json({ ...newLog, locationStatus });
    } catch (error) {
        console.error("Error logging time:", error);
        res.status(500).json({ error: "Erreur lors du pointage" });
    }
};

// Get all today's clock-ins for all employees (For HR Dashboard)
exports.getAllTodayLogs = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const logs = await prisma.timeLog.findMany({
            where: {
                type: 'CLOCK_IN',
                timestamp: { gte: startOfDay }
            },
            include: {
                employee: {
                    select: { firstName: true, lastName: true, department: true, positionTitle: true }
                },
                workSite: { select: { name: true } }
            },
            orderBy: { timestamp: 'desc' } // Most recent first
        });

        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching all today's logs:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

/**
 * Relevé mensuel des heures, à partir des pointages.
 *
 * La chaîne était coupée : les pointages d'un côté, les heures supplémentaires
 * ressaisies à la main dans la paie de l'autre. Ce relevé les rapproche, et
 * signale ce qu'il ne peut pas compter — une entrée sans sortie ne se devine
 * pas, une journée de dix-huit heures est une sortie oubliée.
 */
exports.getReleveMensuel = async (req, res) => {
    try {
        const tempsTravail = require('../lib/tempsTravail');
        res.json(await tempsTravail.releveMensuel(req.query.period));
    } catch (error) {
        console.error('Erreur relevé des heures :', error);
        res.status(500).json({ error: 'Erreur lors du calcul du relevé.' });
    }
};
