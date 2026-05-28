// Script Node.js de test E2E exhaustif de l'API Backend
const API_URL = 'http://localhost:3000';
let adminToken = '';
let hrToken = '';

async function runTests() {
    console.log('🚀 Démarrage de la suite de tests QA End-to-End...');
    
    // TEST 1: Health Check
    try {
        const healthRes = await fetch(`${API_URL}/api/health`);
        const healthData = await healthRes.json();
        if(healthData.status === 'success') console.log('✅ TEST 1: Serveur API Opérationnel');
        else throw new Error('Health check failed');
    } catch(e) {
        console.error('❌ TEST 1 ECHEC: Serveur injoignable', e.message);
        return; // Arrêt critique
    }

    // TEST 2: Auth Login Admin
    try {
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: 'admin@sii.fr', password: 'SIIRH' })
        });
        const loginData = await loginRes.json();
        if(loginRes.ok && loginData.token) {
            adminToken = loginData.token;
            console.log('✅ TEST 2: Authentification Administrateur réussie');
        } else {
            console.error('❌ TEST 2 ECHEC: Authentification Admin a échoué');
        }
    } catch(e) {
        console.error('❌ TEST 2 ECHEC:', e.message);
    }

    // TEST 3: Accès Portail Public (Self-Service)
    try {
        const formData = new FormData();
        formData.append('email', 'employe_test@sii.fr');
        formData.append('type', 'Retard');
        formData.append('date', '2026-06-01');
        formData.append('justification', 'Test E2E de la route publique');
        
        const publicRes = await fetch(`${API_URL}/api/absences/public`, {
            method: 'POST',
            body: formData
        });
        
        // La route peut renvoyer une erreur si l'employé n'existe pas, 
        // mais elle ne doit PAS renvoyer 403 ou 401.
        if (publicRes.status !== 401 && publicRes.status !== 403) {
            console.log('✅ TEST 3: Route Publique Absences ouverte (pas de blocage Auth)');
        } else {
            console.error(`❌ TEST 3 ECHEC: La route publique est toujours bloquée (${publicRes.status})`);
        }
    } catch(e) {
        console.error('❌ TEST 3 ERREUR:', e.message);
    }

    // TEST 4: Fetch Employees List (Admin)
    try {
        const empRes = await fetch(`${API_URL}/api/employees`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if(empRes.ok) {
            const data = await empRes.json();
            console.log(`✅ TEST 4: Chargement de l'annuaire (${data.length} employés trouvés)`);
        } else {
            console.error('❌ TEST 4 ECHEC: Annuaire injoignable');
        }
    } catch(e) {
        console.error('❌ TEST 4 ECHEC:', e.message);
    }

    console.log('🎉 Suite de tests terminée.');
}

runTests();
