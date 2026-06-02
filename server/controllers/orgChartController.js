const prisma = require('../prismaClient');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper heuristic fallback algorithm to build a logical hierarchy programmatically
const generateHeuristicOrgChart = async (employees) => {
    console.log("Generating Org Chart using heuristic fallback algorithm...");
    
    const getRoleRank = (title, sysRole) => {
        const t = (title || "").toLowerCase();
        const r = (sysRole || "").toLowerCase();
        if (t.includes("ceo") || t.includes("pdg") || t.includes("directeur general") || t.includes("directrice generale") || t.includes("fondateur") || r === "administrator") return 1;
        if (t.includes("directeur") || t.includes("directrice") || t.includes("vp") || t.includes("vice")) return 2;
        if (t.includes("manager") || t.includes("chef") || t.includes("responsable") || t.includes("head") || t.includes("lead")) return 3;
        return 4; // Regular employees
    };

    const ranked = employees.map(e => ({
        ...e,
        rank: getRoleRank(e.positionTitle, e.role)
    })).sort((a, b) => a.rank - b.rank);

    const root = ranked[0];
    if (!root) return 0;

    let updateCount = 0;

    // Group managers by department (rank 2 or 3)
    const managersByDept = {};
    ranked.forEach(e => {
        if (e.rank === 2 || e.rank === 3) {
            const dept = (e.department || "Ressources Humaines").toLowerCase().trim();
            if (!managersByDept[dept]) {
                managersByDept[dept] = [];
            }
            managersByDept[dept].push(e);
        }
    });

    for (const emp of ranked) {
        let managerId = null;

        if (emp.id === root.id) {
            managerId = null;
        } else if (emp.rank === 2) {
            managerId = root.id;
        } else {
            const dept = (emp.department || "").toLowerCase().trim();
            const deptManagers = managersByDept[dept] || [];
            const possibleManagers = deptManagers.filter(m => m.id !== emp.id);

            if (possibleManagers.length > 0) {
                managerId = possibleManagers[0].id;
            } else {
                managerId = root.id;
            }
        }

        try {
            await prisma.employee.update({
                where: { id: emp.id },
                data: { managerId }
            });
            updateCount++;
        } catch (err) {
            console.error(`Error updating employee ${emp.id} in heuristic fallback:`, err.message);
        }
    }

    return updateCount;
};

exports.generateOrgChartWithAI = async (req, res) => {
    try {
        // Fetch all current employees
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                positionTitle: true,
                department: true,
                role: true
            }
        });

        if (employees.length === 0) {
            return res.status(400).json({ error: 'Aucun employé trouvé pour générer l\'organigramme.' });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not configured. Falling back to heuristic generation.");
            const updateCount = await generateHeuristicOrgChart(employees);
            return res.status(200).json({ 
                message: "Organigramme généré (via algorithme de secours - clé API manquante)", 
                updated: updateCount 
            });
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const aiModel = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            // Prepare the payload for Gemini
            const employeeData = employees.map(e => ({
                id: e.id,
                name: `${e.firstName} ${e.lastName}`,
                title: e.positionTitle,
                department: e.department,
                role: e.role
            }));

            const prompt = `
            You are an HR Organization Structure Expert.
            I am giving you a list of employees in a company with their IDs, names, job titles, roles, and departments.
            Your task is to build a logical organizational chart by assigning exactly one managerId to each employee.
            
            Rules:
            1. There must be exactly ONE root person (CEO, Director General, Founder, etc.) who has NO manager (managerId = null).
            2. Everyone else MUST have a managerId that corresponds to the ID of another employee in this list.
            3. A person cannot be their own manager.
            4. No circular reporting loops.
            5. Group people logically by department, assigning "Manager", "Director", "Lead", or "Head" titles as managers over "Employees", "Specialists", "Assistants" in the same or related departments.
            6. Return exactly a JSON array of objects matching this schema:
               [
                 { "employeeId": "string (the employee's unique ID)", "managerId": "string (the manager's unique ID or null for CEO)" }
               ]

            Employee List:
            ${JSON.stringify(employeeData, null, 2)}
            `;

            console.log("Calling Gemini API to generate Org Chart based on roles...");

            const result = await aiModel.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            // Clean markdown code blocks if the model included them
            if (text.startsWith("```")) {
                text = text.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
            }

            const generatedData = JSON.parse(text);

            if (!Array.isArray(generatedData)) {
                throw new Error("Invalid format received from Gemini (not an array).");
            }

            // Apply to database
            console.log(`Updating ${generatedData.length} employee hierarchies in database...`);
            
            let updateCount = 0;

            // Run sequentially to avoid sqlite locking issues on many parallel writes
            for (const record of generatedData) {
                if (record.employeeId && record.employeeId !== record.managerId) {
                    try {
                        await prisma.employee.update({
                            where: { id: record.employeeId },
                            data: { managerId: record.managerId }
                        });
                        updateCount++;
                    } catch (updateErr) {
                        console.error(`Skipped updating employee ${record.employeeId}: ${updateErr.message}`);
                    }
                }
            }

            res.status(200).json({ 
                message: "Organigramme généré et appliqué avec succès via IA Gemini", 
                updated: updateCount 
            });

        } catch (aiError) {
            console.error("AI Org Chart generation failed, falling back to heuristics:", aiError.message);
            const updateCount = await generateHeuristicOrgChart(employees);
            res.status(200).json({ 
                message: "Organigramme généré avec succès (algorithme de secours suite à erreur de l'IA)", 
                updated: updateCount 
            });
        }

    } catch (error) {
        console.error('Error in generateOrgChartWithAI:', error);
        res.status(500).json({ error: 'Failed to generate org chart', details: error.message });
    }
};

exports.getOrgChart = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                positionTitle: true,
                department: true,
                managerId: true
            }
        });

        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching org chart data:', error);
        res.status(500).json({ error: 'Failed to fetch org chart data' });
    }
};
