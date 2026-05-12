const prisma = require('../prismaClient');
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

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
            return res.status(400).json({ error: 'No employees found to build an org chart.' });
        }

        // Prepare the payload for Gemini
        const employeeData = employees.map(e => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            title: e.positionTitle,
            department: e.department,
            role: e.role
        }));

        // We want Gemini to output an array of { employeeId, managerId }
        const schema = {
            type: SchemaType.ARRAY,
            description: "List of organizational reporting relationships",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    employeeId: {
                        type: SchemaType.STRING,
                        description: "The unique ID of the employee"
                    },
                    managerId: {
                        type: SchemaType.STRING,
                        description: "The unique ID of the manager this employee reports to.",
                        nullable: true
                    }
                },
                required: ["employeeId"]
            }
        };

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
        6. Return exactly the JSON structure requested, mapping employeeId to managerId.

        Employee List:
        ${JSON.stringify(employeeData, null, 2)}
        `;

        console.log("Calling Gemini API to generate Org Chart based on roles...");

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const generatedData = JSON.parse(response.text());

        if (!Array.isArray(generatedData)) {
            throw new Error("Invalid format received from Gemini.");
        }

        // Apply to database
        console.log(`Updating ${generatedData.length} employee hierarchies in database...`);
        
        let updateCount = 0;

        // Run sequentially to avoid sqlite locking issues on many parallel writes
        for (const record of generatedData) {
            // Validate that we don't assign self as manager and the employeeId is valid
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
            message: "Organigramme généré et appliqué avec succès", 
            updated: updateCount 
        });

    } catch (error) {
        console.error('Error generating org chart with AI:', error);
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
