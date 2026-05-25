const prisma = require('./prismaClient');
async function test() {
    try {
        const emp = await prisma.employee.findFirst();
        console.log("Testing update on:", emp.id);
        const data = {
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: "",
            gender: "Non spécifié",
            birthDate: null,
            address: "",
            nationality: "",
            positionTitle: emp.positionTitle,
            department: emp.department,
            status: emp.status
        };
        const res = await prisma.employee.update({
            where: { id: emp.id },
            data
        });
        console.log("Success:", res);
    } catch(e) {
        console.error("PRISMA ERROR:", e);
    }
}
test();
