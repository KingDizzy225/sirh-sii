const prisma = require('../prismaClient');
const PDFDocument = require('pdfkit');

/**
 * Registre unique du personnel.
 *
 * Document que tout employeur doit pouvoir présenter en cas de contrôle de
 * l'inspection du travail. Toutes les informations exigées figurent déjà dans
 * la base : il ne manquait que la mise en forme, jusqu'ici faite à la main.
 *
 * Les salariés sortis y demeurent — le registre retrace l'ensemble des
 * personnes employées, pas seulement l'effectif du jour.
 */
exports.generateStaffRegister = async (req, res) => {
    try {
        const salaries = await prisma.employee.findMany({
            orderBy: [{ hireDate: 'asc' }, { lastName: 'asc' }]
        });

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename=registre_personnel_${new Date().toISOString().slice(0, 10)}.pdf`);
        doc.pipe(res);

        const organisation = process.env.ORGANISATION_NAME || 'SIRH-SII';
        doc.fontSize(15).fillColor('#0f172a').text('REGISTRE UNIQUE DU PERSONNEL', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#475569')
           .text(`${organisation} — édité le ${new Date().toLocaleDateString('fr-FR')} — ${salaries.length} inscription(s)`,
                 { align: 'center' });
        doc.moveDown(1);

        // Le registre est chronologique : l'ordre d'embauche est ce que
        // l'inspection vérifie en premier.
        const colonnes = [
            { titre: 'N°', largeur: 26 },
            { titre: 'Nom et prénoms', largeur: 130 },
            { titre: 'Emploi occupé', largeur: 120 },
            { titre: 'Nationalité', largeur: 70 },
            { titre: 'Naissance', largeur: 62 },
            { titre: 'Embauche', largeur: 62 },
            { titre: 'Contrat', largeur: 52 },
            { titre: 'Sortie', largeur: 62 },
            { titre: 'Statut', largeur: 70 }
        ];

        const dateOuTiret = (v) => {
            if (!v) return '—';
            const d = new Date(v);
            return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
        };

        const enTete = (y) => {
            let x = 30;
            doc.fontSize(7.5).fillColor('#0f172a').font('Helvetica-Bold');
            for (const c of colonnes) {
                doc.text(c.titre, x, y, { width: c.largeur });
                x += c.largeur;
            }
            doc.moveTo(30, y + 12).lineTo(784, y + 12).strokeColor('#cbd5e1').stroke();
            return y + 18;
        };

        let y = enTete(doc.y);

        salaries.forEach((s, i) => {
            // Saut de page en conservant l'en-tête : un registre doit rester
            // lisible page après page.
            if (y > 520) {
                doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
                y = enTete(40);
            }

            const valeurs = [
                String(i + 1),
                `${s.lastName} ${s.firstName}`,
                s.positionTitle || '—',
                s.nationality || '—',
                dateOuTiret(s.birthDate),
                dateOuTiret(s.hireDate),
                s.contractType || '—',
                dateOuTiret(s.exitDate),
                s.status === 'TERMINATED' ? 'Sorti' : s.status === 'ON_LEAVE' ? 'En congé' : 'En poste'
            ];

            let x = 30;
            doc.font('Helvetica').fontSize(7.5).fillColor('#1e293b');
            valeurs.forEach((v, j) => {
                doc.text(v, x, y, { width: colonnes[j].largeur - 4, ellipsis: true });
                x += colonnes[j].largeur;
            });
            y += 15;
        });

        doc.moveDown(2);
        doc.fontSize(7).fillColor('#94a3b8')
           .text("Registre établi à partir des données du système d'information RH. " +
                 "Les mentions absentes correspondent à des informations non renseignées dans les dossiers.",
                 30, Math.min(y + 12, 560), { width: 754 });

        doc.end();
    } catch (error) {
        console.error('Error generating staff register:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du registre.' });
        }
    }
};
