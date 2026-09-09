const prisma = require('../prismaClient');
const { getGenerativeModel } = require("../lib/claudeAI");
const { normaliserGenre, EFFECTIF_MIN_COMPARAISON, salaireConnu } = require('../lib/demographie');
const absenteisme = require('../lib/absenteisme');
const aiModel = getGenerativeModel();

const getRatingScore = (rating) => {
    if (!rating) return 3.0;
    if (rating.includes('Dépasse') || rating.includes('dépasse')) return 4.5;
    if (rating.includes('Répond') || rating.includes('répond')) return 3.5;
    if (rating.includes('Attente') || rating.includes('attente')) return 3.0;
    if (rating.includes('Insuffisant') || rating.includes('Besoin') || rating.includes('insuffisant') || rating.includes('besoin')) return 1.5;
    return 3.0;
};

/**
 * GET /api/analytics/absenteisme?du=AAAA-MM&au=AAAA-MM
 *
 * Le taux d'absentéisme, que l'application ne savait pas produire. Lecture
 * seule : rien n'est écrit, aucune table nouvelle.
 *
 * Le périmètre retenu et la formule accompagnent le chiffre. Un taux dont on
 * ignore le dénominateur ne se défend pas en réunion, et c'est en réunion que
 * celui-ci sera cité.
 */
exports.getAbsenteisme = async (req, res) => {
    try {
        // Fenêtre par défaut : les douze derniers mois, mois courant compris.
        const finDemandee = req.query.au ? new Date(`${req.query.au}-01T00:00:00Z`) : new Date();
        const debutDemande = req.query.du
            ? new Date(`${req.query.du}-01T00:00:00Z`)
            : (() => { const d = new Date(finDemandee); d.setMonth(d.getMonth() - 11); return d; })();

        if (isNaN(debutDemande.getTime()) || isNaN(finDemandee.getTime())) {
            return res.status(400).json({ error: 'Période invalide. Format attendu : AAAA-MM.' });
        }
        if (debutDemande > finDemandee) {
            return res.status(400).json({ error: 'La date de début est postérieure à la date de fin.' });
        }

        const debut = new Date(debutDemande.getFullYear(), debutDemande.getMonth(), 1);
        const finExclue = new Date(finDemandee.getFullYear(), finDemandee.getMonth() + 1, 1);

        // Les mois sont posés d'avance : un mois sans absence doit apparaître à
        // zéro, non disparaître de la courbe.
        const mois = [];
        for (let d = new Date(debut); d < finExclue; d.setMonth(d.getMonth() + 1)) {
            mois.push(absenteisme.cleMois(d));
        }
        if (mois.length > 36) {
            return res.status(400).json({ error: 'Période trop longue : trente-six mois au plus.' });
        }

        const [conges, absences, salaries] = await Promise.all([
            // Un arrêt qui chevauche la fenêtre est retenu : il compte pour la
            // part de ses jours qui y tombe.
            prisma.leave.findMany({
                where: { startDate: { lt: finExclue }, endDate: { gte: debut } },
                include: { employee: { select: { department: true } } }
            }),
            prisma.absence.findMany({
                where: { date: { gte: debut, lt: finExclue } },
                include: { employee: { select: { department: true } } }
            }),
            prisma.employee.findMany({
                where: { status: { not: 'TERMINATED' } },
                select: { department: true }
            })
        ]);

        const parService = {};
        for (const s of salaries) {
            const service = s.department || 'Non renseigné';
            parService[service] = (parService[service] || 0) + 1;
        }
        const effectifs = Object.entries(parService).map(([department, actifs]) => ({ department, actifs }));

        const resultat = absenteisme.bilan({ conges, absences, effectifs, mois });

        res.json({
            periode: {
                du: absenteisme.cleMois(debut),
                au: mois[mois.length - 1] || absenteisme.cleMois(debut),
                mois: mois.length
            },
            ...resultat,
            // L'effectif retenu est celui d'aujourd'hui, faute d'un effectif
            // daté mois par mois. Le dire : sur une année où l'entreprise a
            // beaucoup recruté, le dénominateur des premiers mois est surévalué.
            reserve: "L'effectif du dénominateur est celui constaté aujourd'hui. "
                + "Sur une période où l'effectif a sensiblement varié, les taux des mois "
                + 'anciens sont à lire avec prudence.'
        });
    } catch (error) {
        console.error("Erreur calcul de l'absentéisme :", error);
        res.status(500).json({ error: "Erreur lors du calcul de l'absentéisme." });
    }
};

exports.getDashboardAnalytics = async (req, res) => {
    try {
        // 1. Effectifs de base
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
        const terminatedEmployees = await prisma.employee.count({ where: { status: 'TERMINATED' } });
        const globalTurnover = totalEmployees > 0
            ? ((terminatedEmployees / totalEmployees) * 100).toFixed(1)
            : 0;

        const onLeaveEmployees = await prisma.leave.count({
            where: {
                status: 'APPROVED',
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
            }
        });

        const allEmployees = await prisma.employee.findMany({ select: { department: true, status: true } });
        const deptMap = {};
        allEmployees.forEach(e => {
            if (!deptMap[e.department]) deptMap[e.department] = { total: 0, terminated: 0 };
            deptMap[e.department].total++;
            if (e.status === 'TERMINATED') deptMap[e.department].terminated++;
        });
        const turnoverByDept = Object.entries(deptMap)
            .filter(([, v]) => v.total > 0)
            .map(([name, v]) => ({ name, rate: parseFloat(((v.terminated / v.total) * 100).toFixed(1)) }));

        // 3. Masse salariale par département (données réelles depuis Payroll)
        const payrolls = await prisma.payroll.findMany({
            include: { employee: { select: { department: true } } }
        });
        const salaryDeptMap = {};
        payrolls.forEach(p => {
            const dept = p.employee?.department || 'Inconnu';
            if (!salaryDeptMap[dept]) salaryDeptMap[dept] = { total: 0, count: 0 };
            salaryDeptMap[dept].total += p.baseSalary || 0;
            salaryDeptMap[dept].count++;
        });
        const salaryByDept = Object.entries(salaryDeptMap).map(([name, v]) => ({
            name,
            Moyenne: Math.round(v.total / (v.count || 1)),
            Total: Math.round(v.total)
        }));

        // 4. Dépenses par département (données réelles depuis Expense)
        const expenses = await prisma.expense.findMany({
            include: { employee: { select: { department: true } } }
        });
        const expenseDeptMap = {};
        expenses.forEach(exp => {
            const dept = exp.employee?.department || 'Inconnu';
            if (!expenseDeptMap[dept]) expenseDeptMap[dept] = 0;
            expenseDeptMap[dept] += exp.amount || 0;
        });
        const expensesByDept = Object.entries(expenseDeptMap).map(([name, total]) => ({
            name,
            Montant: Math.round(total)
        }));

        // 5. Répartition des contrats.
        //
        // Cette série comptait les types des *offres d'emploi* publiées, sous un
        // intitulé qui annonce la répartition des contrats du personnel. Un
        // lecteur y voyait l'effectif ; il regardait le plan de recrutement.
        // Elle est désormais lue sur les fiches salariés.
        const salariesActifs = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { contractType: true }
        });
        const contractTypeMap = {};
        salariesActifs.forEach((e) => {
            const type = e.contractType || 'Non renseigné';
            contractTypeMap[type] = (contractTypeMap[type] || 0) + 1;
        });
        const contractTypes = Object.entries(contractTypeMap).map(([name, value]) => ({ name, value }));

        // 6. Flux mensuel des entrées et des sorties (6 derniers mois).
        //
        // Les sorties étaient rangées au mois de l'*embauche* : un salarié
        // recruté en mars et parti en août apparaissait comme un départ de
        // mars. Le graphique montrait ainsi des départs avant l'arrivée des
        // intéressés. Chaque événement est désormais daté par ce qui le date :
        // l'entrée par la date d'embauche, la sortie par la date de sortie.
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [entrees, sorties] = await Promise.all([
            prisma.employee.findMany({
                where: { hireDate: { gte: sixMonthsAgo } }, select: { hireDate: true }
            }),
            prisma.employee.findMany({
                where: { exitDate: { gte: sixMonthsAgo } }, select: { exitDate: true }
            })
        ]);

        // Les mois sont posés d'avance, du plus ancien au plus récent : un mois
        // sans mouvement doit apparaître à zéro, non disparaître de la courbe.
        const moisFlux = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            moisFlux.push({
                cle: `${d.getFullYear()}-${d.getMonth()}`,
                month: d.toLocaleDateString('fr-FR', { month: 'short' }),
                Entrées: 0,
                Départs: 0
            });
        }
        const parCle = new Map(moisFlux.map((m) => [m.cle, m]));
        const cleDe = (v) => { const d = new Date(v); return `${d.getFullYear()}-${d.getMonth()}`; };
        entrees.forEach((e) => { const m = parCle.get(cleDe(e.hireDate)); if (m) m.Entrées++; });
        sorties.forEach((e) => { const m = parCle.get(cleDe(e.exitDate)); if (m) m.Départs++; });
        const monthlyFlux = moisFlux.map(({ cle, ...reste }) => reste);

        // 7. Absentéisme réel (jours de congés PENDING + APPROVED ce mois)
        const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
        const leavesThisMonth = await prisma.leave.findMany({
            where: { createdAt: { gte: startOfMonth } }
        });
        const totalAbsenceDays = leavesThisMonth.reduce((acc, l) => acc + (l.durationDays || 0), 0);
        const absenceRate = activeEmployees > 0
            ? ((totalAbsenceDays / (activeEmployees * 22)) * 100).toFixed(1) : 0;

        // 8. KPIs Paie (mois actuel)
        const payrollsThisMonth = await prisma.payroll.findMany({
            where: { period: { gte: startOfMonth }, status: 'APPROVED' }
        });
        const totalNetSalary = payrollsThisMonth.reduce((acc, p) => acc + (p.netSalary || 0), 0);
        const avgNetSalary = payrollsThisMonth.length > 0 ? Math.round(totalNetSalary / payrollsThisMonth.length) : 0;

        // 8 bis. Variations d'un mois sur l'autre.
        // L'interface affichait des pourcentages écrits en dur (« +4 % »,
        // « −2,1 % ») à côté de valeurs réelles : le lecteur ne pouvait pas les
        // distinguer d'une mesure. Ils sont désormais calculés, et valent null
        // lorsqu'il n'existe pas de mois précédent auquel se comparer.
        const debutMoisPrecedent = new Date(startOfMonth);
        debutMoisPrecedent.setMonth(debutMoisPrecedent.getMonth() - 1);

        const [paiesMoisPrecedent, entreesCeMois, sortiesCeMois] = await Promise.all([
            prisma.payroll.findMany({
                where: { period: { gte: debutMoisPrecedent, lt: startOfMonth }, status: 'APPROVED' },
                select: { netSalary: true }
            }),
            prisma.employee.count({ where: { hireDate: { gte: startOfMonth } } }),
            prisma.employee.count({ where: { exitDate: { gte: startOfMonth } } })
        ]);

        const netMoisPrecedent = paiesMoisPrecedent.reduce((a, p) => a + (p.netSalary || 0), 0);
        const variation = (actuel, precedent) =>
            precedent > 0 ? parseFloat((((actuel - precedent) / precedent) * 100).toFixed(1)) : null;

        const effectifDebutMois = activeEmployees - entreesCeMois + sortiesCeMois;
        const variations = {
            effectif: variation(activeEmployees, effectifDebutMois),
            masseSalariale: variation(totalNetSalary, netMoisPrecedent),
            entreesCeMois,
            sortiesCeMois
        };

        // 9. Pyramide des âges dynamique
        const employeesForAge = await prisma.employee.findMany({ 
            select: { birthDate: true, gender: true }, 
            where: { status: 'ACTIVE', birthDate: { not: null } } 
        });
        
        const ageGroups = {
            '18-25': { male: 0, female: 0 },
            '26-35': { male: 0, female: 0 },
            '36-45': { male: 0, female: 0 },
            '46-55': { male: 0, female: 0 },
            '56+': { male: 0, female: 0 }
        };

        const currentYear = new Date().getFullYear();
        employeesForAge.forEach(emp => {
            const age = currentYear - new Date(emp.birthDate).getFullYear();
            let group = '56+';
            if (age >= 18 && age <= 25) group = '18-25';
            else if (age >= 26 && age <= 35) group = '26-35';
            else if (age >= 36 && age <= 45) group = '36-45';
            else if (age >= 46 && age <= 55) group = '46-55';
            
            const isMale = emp.gender === 'Homme' || emp.gender === 'Masculin' || emp.gender === 'M';
            if (isMale) {
                ageGroups[group].male -= 1; // Negative for Pyramid view on Recharts
            } else {
                ageGroups[group].female += 1;
            }
        });

        const agePyramidData = Object.keys(ageGroups).map(ageGroup => ({
            ageGroup,
            male: ageGroups[ageGroup].male,
            female: ageGroups[ageGroup].female
        }));

        // La pyramide se lit sur les dates de naissance renseignées. Elle
        // reposait sur un jeu de valeurs inventées dès que ce n'était pas le
        // cas : un effectif de 145 personnes s'affichait chez un employeur qui
        // en compte sept.
        const finalAgePyramidData = employeesForAge.length > 0 ? agePyramidData : [];

        /**
         * 9 bis. Écart de rémunération entre femmes et hommes, par service.
         *
         * Cette série était écrite en dur — « Ingénierie 450 / 430 », pour des
         * services qui n'existent pas nécessairement — et s'affichait en toutes
         * circonstances, mesurée ou non. C'est le chiffre le plus dangereux que
         * l'application pouvait produire : un écart salarial se cite en réunion,
         * puis en comité, puis dans un rapport.
         *
         * Il est désormais calculé, et soumis à un seuil : sous
         * EFFECTIF_MIN_COMPARAISON personnes d'un genre dans un service, la
         * moyenne du groupe revient à divulguer une rémunération individuelle.
         * Mieux vaut alors ne rien publier.
         */
        const salariesRemuneres = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                department: true, gender: true, baseSalary: true,
                payrolls: { orderBy: { period: 'desc' }, take: 1, select: { baseSalary: true } }
            }
        });

        const parService = new Map();
        const couvertureEcart = { retenus: 0, sansGenre: 0, sansSalaire: 0 };
        for (const emp of salariesRemuneres) {
            const genre = normaliserGenre(emp.gender);
            if (!genre) { couvertureEcart.sansGenre++; continue; }
            const salaire = salaireConnu(emp);
            if (salaire === 0) { couvertureEcart.sansSalaire++; continue; }

            const service = emp.department || 'Non renseigné';
            if (!parService.has(service)) {
                parService.set(service, { M: [], F: [] });
            }
            parService.get(service)[genre].push(salaire);
            couvertureEcart.retenus++;
        }

        const moyenne = (t) => Math.round(t.reduce((a, b) => a + b, 0) / t.length);
        const genderPayGapData = [...parService.entries()]
            .filter(([, g]) => g.M.length >= EFFECTIF_MIN_COMPARAISON
                            && g.F.length >= EFFECTIF_MIN_COMPARAISON)
            .map(([department, g]) => ({
                department,
                male: moyenne(g.M),
                female: moyenne(g.F),
                effectifM: g.M.length,
                effectifF: g.F.length
            }));

        const servicesSousSeuil = parService.size - genderPayGapData.length;

        /**
         * 9 ter. Turnover mensuel des douze derniers mois.
         *
         * Écrit en dur lui aussi (« Jan 2,1 % … Juin 1,5 % »). Il se calcule
         * pourtant : les sorties du mois rapportées à l'effectif du mois.
         */
        const douzeMois = new Date();
        douzeMois.setDate(1);
        douzeMois.setHours(0, 0, 0, 0);
        douzeMois.setMonth(douzeMois.getMonth() - 11);

        const sortiesAnnee = await prisma.employee.findMany({
            where: { exitDate: { gte: douzeMois } }, select: { exitDate: true }
        });

        const moisTurnover = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            moisTurnover.push({
                cle: `${d.getFullYear()}-${d.getMonth()}`,
                name: d.toLocaleDateString('fr-FR', { month: 'short' }),
                sorties: 0
            });
        }
        const turnoverParCle = new Map(moisTurnover.map((m) => [m.cle, m]));
        sortiesAnnee.forEach((e) => {
            const d = new Date(e.exitDate);
            const m = turnoverParCle.get(`${d.getFullYear()}-${d.getMonth()}`);
            if (m) m.sorties++;
        });

        // Le dénominateur est l'effectif présent : sans lui, un départ sur cinq
        // personnes et un départ sur cinq cents donneraient le même taux.
        const monthlyTurnover = activeEmployees > 0
            ? moisTurnover.map(({ name, sorties }) => ({
                name, rate: parseFloat(((sorties / activeEmployees) * 100).toFixed(1)), sorties
            }))
            : [];

        /**
         * 9 quater. Mobilité interne contre recrutement externe.
         *
         * Une part fixe de 35 / 65 s'affichait, quelle que soit la réalité.
         * L'historisation des situations, en place depuis le 8 septembre,
         * permet enfin de la mesurer : un changement de poste consigné est une
         * mobilité, une date d'embauche est un recrutement.
         */
        const [mobilites, recrutements] = await Promise.all([
            prisma.situationEmployee.count({
                where: {
                    effectiveFrom: { gte: douzeMois },
                    source: 'OBSERVEE',
                    positionTitle: { not: null }
                }
            }),
            prisma.employee.count({ where: { hireDate: { gte: douzeMois } } })
        ]);

        const totalPourvus = mobilites + recrutements;
        const mobilityVsHiringData = totalPourvus > 0 ? [
            { name: 'Mobilité interne', value: mobilites, color: '#10b981' },
            { name: 'Recrutement externe', value: recrutements, color: '#3b82f6' }
        ] : [];

        /**
         * 9 quinquies. Délai de recrutement.
         *
         * Six mois de valeurs écrites en dur (« 24, 22, 28, 21, 19, 18 jours »),
         * affichées sans condition. Le délai n'est pas calculable en l'état : la
         * candidature porte sa date de dépôt et son statut, jamais la date à
         * laquelle elle est passée à « recrutée ».
         *
         * `hiredAt` est ajouté à la candidature et renseigné au passage au
         * statut « Hired ». L'indicateur restera donc vide jusqu'au premier
         * recrutement postérieur à cette mise en service — ce qui est la
         * réponse exacte, là où six nombres inventés ne l'étaient pas.
         */
        const recrutes = await prisma.applicant.findMany({
            where: { status: 'Hired', hiredAt: { not: null } },
            select: { appliedDate: true, hiredAt: true },
            orderBy: { hiredAt: 'asc' }
        });

        const delaisParMois = new Map();
        for (const c of recrutes) {
            const jours = Math.round(
                (new Date(c.hiredAt) - new Date(c.appliedDate)) / 86400000
            );
            if (jours < 0) continue; // dossier incohérent : ignoré, jamais corrigé d'office
            const d = new Date(c.hiredAt);
            const cle = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            if (!delaisParMois.has(cle)) delaisParMois.set(cle, []);
            delaisParMois.get(cle).push(jours);
        }
        const timeToHireData = [...delaisParMois.entries()].map(([month, jours]) => ({
            month, days: moyenne(jours), recrutements: jours.length
        }));

        // 10. Répartition par Ancienneté
        const seniorityGroups = {
            '0-1 an': 0,
            '1-3 ans': 0,
            '3-5 ans': 0,
            '5-10 ans': 0,
            '10+ ans': 0
        };

        // `hireDate` est obligatoire au schéma : Prisma rejette `not: null` sur
        // un champ non nullable, et l'ensemble du tableau de bord analytique
        // répondait en erreur serveur. Le filtre était de toute façon inutile.
        const employeesForSeniority = await prisma.employee.findMany({
            select: { hireDate: true },
            where: { status: 'ACTIVE' }
        });

        const currentDate = new Date();
        employeesForSeniority.forEach(emp => {
            const hireDate = new Date(emp.hireDate);
            const diffTime = Math.abs(currentDate - hireDate);
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
            
            if (diffYears <= 1) seniorityGroups['0-1 an']++;
            else if (diffYears <= 3) seniorityGroups['1-3 ans']++;
            else if (diffYears <= 5) seniorityGroups['3-5 ans']++;
            else if (diffYears <= 10) seniorityGroups['5-10 ans']++;
            else seniorityGroups['10+ ans']++;
        });

        const seniorityData = Object.keys(seniorityGroups).map(name => ({
            name,
            value: seniorityGroups[name]
        }));

        const finalSeniorityData = employeesForSeniority.length > 0 ? seniorityData : [];

        res.status(200).json({
            stats: {
                totalEmployees,
                activeEmployees,
                globalTurnover: parseFloat(globalTurnover) || 0,
                absenceRate: parseFloat(absenceRate) || 0,
                payrollCount: payrollsThisMonth.length,
                avgNetSalary,
                totalNetSalary: Math.round(totalNetSalary),
                variations
            },
            charts: {
                turnoverByDept,
                salaryByDept,
                expensesByDept,
                contractTypes,
                monthlyFlux,
                timeToHireData,
                genderPayGapData,
                monthlyTurnover,
                agePyramidData: finalAgePyramidData,
                mobilityVsHiringData,
                seniorityData: finalSeniorityData
            },
            /**
             * Ce que l'application ne sait pas mesurer, et pourquoi.
             *
             * Onze séries recevaient jusqu'ici des valeurs écrites en dur quand
             * la donnée manquait, et quatre d'entre elles s'affichaient ainsi
             * en toutes circonstances. Rien ne distinguait à l'écran un chiffre
             * mesuré d'un chiffre inventé.
             *
             * Une série vide s'affiche désormais vide, accompagnée de la phrase
             * qui dit ce qui manque. C'est moins flatteur et c'est vérifiable.
             */
            indisponibles: Object.fromEntries(Object.entries({
                turnoverByDept: turnoverByDept.length === 0
                    ? "Aucun service ne compte encore de salarié dont le dossier soit exploitable."
                    : null,
                salaryByDept: salaryByDept.length === 0
                    ? "Aucun bulletin de paie n'est enregistré : la masse salariale par service n'est pas calculable."
                    : null,
                expensesByDept: expensesByDept.length === 0
                    ? "Aucune note de frais n'a encore été saisie."
                    : null,
                contractTypes: contractTypes.length === 0
                    ? "Aucun salarié actif : la répartition des contrats est sans objet."
                    : null,
                // Six mois à zéro sont une mesure, pas une panne d'affichage :
                // la courbe reste, la phrase dit qu'elle est juste.
                monthlyFlux: monthlyFlux.every((m) => m.Entrées === 0 && m.Départs === 0)
                    ? "Aucune entrée ni sortie sur les six derniers mois."
                    : null,
                timeToHireData: timeToHireData.length === 0
                    ? "Le délai de recrutement se mesure depuis la mise en service du suivi : "
                      + "il apparaîtra au premier recrutement conclu dans l'application."
                    : null,
                genderPayGapData: genderPayGapData.length === 0
                    ? (couvertureEcart.retenus === 0
                        ? "Écart non calculable : ni genre ni salaire de référence ne sont renseignés sur les fiches."
                        : `Aucun service ne compte au moins ${EFFECTIF_MIN_COMPARAISON} femmes `
                          + `et ${EFFECTIF_MIN_COMPARAISON} hommes. Publier une moyenne sous ce seuil `
                          + "reviendrait à divulguer une rémunération individuelle.")
                    : (servicesSousSeuil > 0
                        ? `${servicesSousSeuil} service(s) sont écartés du graphique, faute d'un effectif `
                          + "suffisant dans chaque groupe pour qu'une moyenne ne désigne pas quelqu'un."
                        : null),
                monthlyTurnover: monthlyTurnover.length === 0
                    ? "Aucun salarié actif : le turnover n'a pas de dénominateur."
                    : null,
                agePyramidData: finalAgePyramidData.length === 0
                    ? "Aucune date de naissance n'est renseignée sur les fiches salariés."
                    : null,
                mobilityVsHiringData: mobilityVsHiringData.length === 0
                    ? "Ni changement de poste ni embauche sur les douze derniers mois."
                    : null,
                seniorityData: finalSeniorityData.length === 0
                    ? "Aucun salarié actif."
                    : null
            }).filter(([, motif]) => motif !== null)),
            couverture: {
                ecartSalarial: couvertureEcart,
                servicesSousSeuil,
                effectifMinComparaison: EFFECTIF_MIN_COMPARAISON
            }
        });
    } catch (error) {
        console.error("Erreur Analytics:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
};

exports.getPredictiveAnalytics = async (req, res) => {
    // `promptData` était déclaré à l'intérieur du `try` et lu depuis le `catch`,
    // où il n'existe pas : le repli heuristique — écrit précisément pour que la
    // fonction marche sans IA — levait lui-même une ReferenceError. Toute
    // indisponibilité de l'IA se soldait donc par une erreur serveur.
    let promptData = [];
    try {
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                leaves: { select: { type: true, status: true, durationDays: true } },
                payrolls: { select: { netSalary: true, status: true } },
                performanceReviews: { select: { rating: true } }
            }
        });

        if (employees.length === 0) return res.json([]);

        // Anonymize/Simplify data for the prompt
        promptData = employees.map(emp => {
            const totalLeaves = emp.leaves.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + (l.durationDays || 0), 0);
            const sickLeaves = emp.leaves.filter(l => l.status === 'APPROVED' && l.type === 'Congé Maladie').reduce((sum, l) => sum + (l.durationDays || 0), 0);
            const avgSalary = emp.payrolls.length > 0 ? (emp.payrolls[0].netSalary || 0) : 0;
            const avgScore = emp.performanceReviews.length > 0 ? getRatingScore(emp.performanceReviews[0].rating) : 3;
            const yearsOfService = (new Date() - new Date(emp.hireDate)) / (1000 * 60 * 60 * 24 * 365);

            return {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                department: emp.department,
                yearsOfService: yearsOfService.toFixed(1),
                totalLeaves,
                sickLeaves,
                avgSalary,
                avgScore
            };
        });

        const systemPrompt = `Tu es un expert RH en analytique prédictive. Voici les données simplifiées d'employés d'une entreprise. 
Analyse ces données pour déterminer un "Risque de Départ" (Élevé, Moyen, Faible). 
Critères possibles d'alerte (Risque Élevé) : score de performance très bas (< 2.5), ancienneté élevée sans augmentation (simulé ici), ou un nombre anormal de congés maladie courts récents.
Critères possibles (Risque Moyen) : Beaucoup de congés récemment ou baisse de performance.

Renvoie UNIQUEMENT un tableau JSON valide de ce type :
[
  { "id": "123", "name": "Jean Dupont", "riskLevel": "Élevé", "reason": "Baisse de perf et forte ancienneté" }
]

Données :
${JSON.stringify(promptData)}
`;

        // L'absence de clé n'est plus une erreur : elle mène au repli, comme
        // n'importe quelle autre indisponibilité de l'IA.
        if (!aiModel) throw new Error('IA non configurée — repli heuristique.');

        const result = await aiModel.generateContent(systemPrompt);
        const response = await result.response;
        const textResponse = response.text();
        const textRes = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const insights = JSON.parse(textRes);

        return res.status(200).json(Array.isArray(insights) ? insights : []);
    } catch (error) {
        console.warn("Analytique prédictive : repli heuristique —", error.message);

        // Si l'échec porte sur la lecture des données et non sur l'IA, il n'y a
        // rien à analyser. Le repli conclurait alors « climat social stable » —
        // une affirmation rassurante tirée d'une absence d'information.
        if (promptData.length === 0) {
            return res.status(500).json({
                error: "Analyse indisponible : les données des collaborateurs n'ont pas pu être lues."
            });
        }

        // Heuristic fallback for "Expert RH" feel even without AI
        const fallbackInsights = [];
        promptData.forEach(emp => {
            let riskScore = 0;
            let reasons = [];
            
            // Heuristic 1: Low performance
            if (emp.avgScore < 3.0) { riskScore += 40; reasons.push("Performance en baisse"); }
            
            // Heuristic 2: High seniority without high salary (simulated proxy)
            if (emp.yearsOfService > 3 && emp.avgSalary < 500000) { riskScore += 30; reasons.push("Ancienneté élevée avec package non compétitif"); }
            else if (emp.yearsOfService > 5) { riskScore += 15; reasons.push("Forte ancienneté (>5 ans)"); }
            
            // Heuristic 3: High absenteeism (sick leaves)
            if (emp.sickLeaves > 15) { riskScore += 25; reasons.push("Absentéisme maladie fréquent"); }
            else if (emp.totalLeaves > 30) { riskScore += 10; reasons.push("Congés fréquents"); }

            let riskLevel = 'Faible';
            if (riskScore >= 60) riskLevel = 'Élevé';
            else if (riskScore >= 35) riskLevel = 'Moyen';

            if (riskLevel !== 'Faible') {
                fallbackInsights.push({
                    id: emp.id,
                    name: emp.name,
                    department: emp.department,
                    riskLevel,
                    riskScore,
                    reason: reasons.join(" + ") || "Facteurs multiples détectés"
                });
            }
        });

        // Add a generic one if empty
        if (fallbackInsights.length === 0) {
            fallbackInsights.push({
                id: "heur-sys-1",
                name: "Système Prédictif",
                department: "Tous",
                riskLevel: "Faible",
                riskScore: 10,
                reason: "Climat social stable, aucun risque majeur détecté par l'algorithme heuristique."
            });
        }

        // Sort by highest risk
        fallbackInsights.sort((a, b) => b.riskScore - a.riskScore);

        res.status(200).json(fallbackInsights.slice(0, 5));
    }
};

exports.calculateFlightRisk = async (req, res) => {
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'La clé ANTHROPIC_API_KEY n\'est pas configurée sur le serveur.' });
        
        const { id } = req.params;
        const emp = await prisma.employee.findUnique({
            where: { id },
            include: {
                leaves: { select: { type: true, status: true, durationDays: true } },
                payrolls: { select: { netSalary: true } },
                performanceReviews: { select: { rating: true } },
                timeLogs: { orderBy: { timestamp: 'desc' }, take: 10 }
            }
        });

        if (!emp) return res.status(404).json({ error: 'Employé introuvable' });

        const totalLeaves = emp.leaves.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + (l.durationDays || 0), 0);
        const avgSalary = emp.payrolls.length > 0 ? (emp.payrolls[0].netSalary || 0) : 0;
        const avgScore = emp.performanceReviews.length > 0 ? getRatingScore(emp.performanceReviews[0].rating) : 3;
        const yearsOfService = (new Date() - new Date(emp.hireDate)) / (1000 * 60 * 60 * 24 * 365);

        const promptData = {
            name: `${emp.firstName} ${emp.lastName}`,
            department: emp.department,
            yearsOfService: yearsOfService.toFixed(1),
            totalLeaves,
            avgSalary,
            avgScore,
            recentTimeLogs: emp.timeLogs.map(t => t.type)
        };
        const localModel = getGenerativeModel();

        const systemPrompt = `Tu es un expert RH en analytique prédictive.
        Analyse les données de cet employé et retourne un score de risque de démission (Flight Risk) entre 0 et 100, et une raison détaillée de max 2 phrases.
        Retourne UNIQUEMENT un objet JSON valide de ce type :
        { "riskScore": 75, "riskLevel": "Élevé", "reason": "Baisse de performance et ancienneté élevée sans évolution de salaire récente." }
        
        Données :
        ${JSON.stringify(promptData)}`;

        const result = await localModel.generateContent(systemPrompt);
        const textResponse = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const insight = JSON.parse(textResponse);

        res.status(200).json(insight);
    } catch (error) {
        console.error("Erreur Flight Risk AI:", error);
        res.status(500).json({ error: 'Erreur lors de l\'évaluation du risque' });
    }
};
