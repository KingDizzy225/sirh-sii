const prisma = require('../prismaClient');
const PDFDocument = require('pdfkit');
const sousTraitance = require('../lib/sousTraitance');

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
        const [salaries, externes] = await Promise.all([
            prisma.employee.findMany({
                orderBy: [{ hireDate: 'asc' }, { lastName: 'asc' }]
            }),
            // Le personnel extérieur figure au registre : c'est le rapprochement
            // entre les personnes présentes sur site et celles qui sont
            // déclarées qu'un contrôle cherche à faire. Le registre ne lisait
            // que la table des salariés, et cette partie manquait.
            prisma.subcontractor.findMany({
                include: { documents: true },
                orderBy: [{ startDate: 'asc' }, { companyName: 'asc' }]
            })
        ]);

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
        // Le matricule et le numéro CNPS sont des mentions attendues du
        // registre. Ils manquaient : le document s'imprimait, mais un contrôle
        // ne pouvait rattacher aucune ligne à une déclaration.
        const colonnes = [
            { titre: 'N°', largeur: 26 },
            { titre: 'Matricule', largeur: 58 },
            { titre: 'Nom et prénoms', largeur: 118 },
            { titre: 'N° CNPS', largeur: 72 },
            { titre: 'Emploi occupé', largeur: 104 },
            { titre: 'Nationalité', largeur: 58 },
            { titre: 'Naissance', largeur: 62 },
            { titre: 'Embauche', largeur: 62 },
            { titre: 'Contrat', largeur: 52 },
            { titre: 'Sortie', largeur: 62 },
            { titre: 'Statut', largeur: 52 }
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
                s.matricule || '—',
                `${s.lastName} ${s.firstName}`,
                s.cnpsNumber || '—',
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

        // --- Personnel extérieur ---
        if (externes.length > 0) {
            doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
            doc.fontSize(12).fillColor('#0f172a')
               .text('PERSONNEL EXTÉRIEUR À L\'ENTREPRISE', 30, 35);
            doc.fontSize(8).fillColor('#475569')
               .text(`${externes.length} prestataire(s) — sous-traitants, intérimaires et consultants`, 30, 52);

            const colonnesExternes = [
                { titre: 'N°', largeur: 26 },
                { titre: 'Société', largeur: 150 },
                { titre: 'Intervenant', largeur: 120 },
                { titre: 'Nature', largeur: 70 },
                { titre: 'N° CNPS', largeur: 80 },
                { titre: 'Début', largeur: 62 },
                { titre: 'Fin', largeur: 62 },
                { titre: 'Pièces au dossier', largeur: 130 }
            ];

            const enTeteExternes = (yy) => {
                let x = 30;
                doc.fontSize(7.5).fillColor('#0f172a').font('Helvetica-Bold');
                for (const c of colonnesExternes) {
                    doc.text(c.titre, x, yy, { width: c.largeur });
                    x += c.largeur;
                }
                doc.moveTo(30, yy + 12).lineTo(784, yy + 12).strokeColor('#cbd5e1').stroke();
                return yy + 18;
            };

            let ye = enTeteExternes(75);

            externes.forEach((e, i) => {
                if (ye > 520) {
                    doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
                    ye = enTeteExternes(40);
                }

                const etat = sousTraitance.bilan(e, e.documents);
                // L'état des pièces figure au registre parce que c'est là qu'il
                // se vérifie : un prestataire inscrit mais non couvert engage
                // le donneur d'ordre pour les salariés qu'il n'a pas déclarés.
                const mention = etat.couvert
                    ? 'Complètes'
                    : `Manque : ${etat.bloquantes.map((b) => b.libelle).join(', ')}`;

                const valeurs = [
                    String(i + 1),
                    e.companyName || '—',
                    `${e.lastName || ''} ${e.firstName || ''}`.trim() || '—',
                    e.type || '—',
                    e.cnpsNumber || '—',
                    dateOuTiret(e.startDate),
                    dateOuTiret(e.endDate),
                    mention
                ];

                let x = 30;
                doc.font('Helvetica').fontSize(7.5)
                   .fillColor(etat.couvert ? '#1e293b' : '#b91c1c');
                valeurs.forEach((v, j) => {
                    doc.text(v, x, ye, { width: colonnesExternes[j].largeur - 4, ellipsis: true });
                    x += colonnesExternes[j].largeur;
                });
                ye += 15;
            });

            y = ye;
        }

        doc.moveDown(2);
        doc.fontSize(7).fillColor('#94a3b8')
           .text("Registre établi à partir des données du système d'information RH. " +
                 "Les mentions absentes correspondent à des informations non renseignées dans les dossiers. " +
                 "L'état des pièces des prestataires est celui constaté à la date d'édition.",
                 30, Math.min(y + 12, 560), { width: 754 });

        doc.end();
    } catch (error) {
        console.error('Error generating staff register:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du registre.' });
        }
    }
};
