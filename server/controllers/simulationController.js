const prisma = require('../prismaClient');

// ----------------------------------------------------
// SIMULATION
// ----------------------------------------------------

exports.createSimulation = async (req, res) => {
    try {
        const { name, description, copyCurrentOrg } = req.body;
        const { email } = req.user;

        const employee = await prisma.employee.findUnique({ where: { email } });
        
        const simulation = await prisma.orgSimulation.create({
            data: {
                name,
                description,
                createdBy: employee ? employee.id : 'SYSTEM'
            }
        });

        // Copy current Org if requested
        if (copyCurrentOrg) {
            const allEmployees = await prisma.employee.findMany({
                where: { status: 'ACTIVE' },
                include: { payrolls: { orderBy: { paymentDate: 'desc' }, take: 1 } }
            });

            // Need to map old IDs to new Node IDs so we can rebuild hierarchy
            const idMap = new Map();

            // Pass 1: Create nodes
            for (const emp of allEmployees) {
                // Estimate monthly salary from payroll or default
                const monthlySalary = emp.payrolls.length > 0 ? emp.payrolls[0].baseSalary : 500000;

                const node = await prisma.orgSimulationNode.create({
                    data: {
                        simulationId: simulation.id,
                        employeeId: emp.id,
                        title: emp.positionTitle,
                        department: emp.department,
                        monthlySalary,
                        isVacant: false
                    }
                });
                idMap.set(emp.id, node.id);
            }

            // Pass 2: Update hierarchy
            for (const emp of allEmployees) {
                if (emp.managerId && idMap.has(emp.managerId)) {
                    const nodeId = idMap.get(emp.id);
                    const parentNodeId = idMap.get(emp.managerId);
                    
                    await prisma.orgSimulationNode.update({
                        where: { id: nodeId },
                        data: { parentId: parentNodeId }
                    });
                }
            }
        }

        res.status(201).json(simulation);
    } catch (error) {
        console.error("Error creating simulation:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getSimulations = async (req, res) => {
    try {
        const simulations = await prisma.orgSimulation.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(simulations);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getSimulationById = async (req, res) => {
    try {
        const { id } = req.params;
        const simulation = await prisma.orgSimulation.findUnique({
            where: { id },
            include: {
                nodes: {
                    include: {
                        employee: {
                            select: { firstName: true, lastName: true, email: true }
                        }
                    }
                }
            }
        });

        if (!simulation) return res.status(404).json({ error: "Introuvable" });
        res.json(simulation);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteSimulation = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.orgSimulation.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// ----------------------------------------------------
// NODES
// ----------------------------------------------------

exports.createNode = async (req, res) => {
    try {
        const { simulationId, parentId, title, department, monthlySalary, isVacant, employeeId } = req.body;
        
        const node = await prisma.orgSimulationNode.create({
            data: {
                simulationId,
                parentId: parentId || null,
                title,
                department,
                monthlySalary: monthlySalary || 0,
                isVacant: isVacant || false,
                employeeId: employeeId || null
            }
        });
        res.status(201).json(node);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.updateNode = async (req, res) => {
    try {
        const { id } = req.params;
        const { parentId, title, department, monthlySalary } = req.body;

        const updated = await prisma.orgSimulationNode.update({
            where: { id },
            data: {
                parentId: parentId === 'root' ? null : parentId,
                title,
                department,
                monthlySalary
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteNode = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Before deleting, we might need to handle children (e.g. set parentId to null or reassign)
        // Here we just set their parent to null
        await prisma.orgSimulationNode.updateMany({
            where: { parentId: id },
            data: { parentId: null }
        });

        await prisma.orgSimulationNode.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
