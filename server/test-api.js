(async () => {
    try {
        const res = await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'TestAPI',
                lastName: 'UserAPI',
                email: `testapi.userapi${Math.random()}@entreprise.com`,
                role: 'Employee',
                department: 'Ressources Humaines',
                positionTitle: 'Poste Non Assigné',
                status: 'ACTIVE'
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error(e);
    }
})();
