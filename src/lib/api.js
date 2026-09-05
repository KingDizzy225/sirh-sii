// Si VITE_API_URL est fourni sans /api à la fin (comme c'est le cas pour la plupart des composants), on l'ajoute.
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('sirh_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// Jeton de la session de démonstration hors ligne — ouverte uniquement quand le
// serveur est injoignable. Défini ici, dans le module bas niveau, et importé par
// AuthContext : une seule définition, et la dépendance ne va que dans un sens.
export const DEMO_TOKEN = 'demo-sirh-token-2026';

// Session expirée ou jeton invalide : on nettoie et on renvoie vers la connexion
// plutôt que de laisser l'utilisateur devant une page vide ou des données de repli.
const handleUnauthorized = () => {
    localStorage.removeItem('sirh_token');
    localStorage.removeItem('sirh_user');
    if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1');
    }
};

/**
 * Garantit qu'une valeur destinée à un état de liste est bien un tableau.
 *
 * Une réponse d'erreur est un objet — `{ error: "..." }`. Placée telle quelle
 * dans un état de liste par un `setX(await res.json())` sans garde, elle faisait
 * échouer le premier `.filter()` du rendu et l'écran entier basculait sur la
 * page d'erreur : « x.filter is not a function ».
 *
 * L'échec n'est pas masqué pour autant : il est journalisé avec le motif
 * renvoyé par le serveur, faute de quoi une page vide deviendrait
 * indiscernable d'une absence de données.
 *
 * @param {*} valeur Ce que le serveur a renvoyé.
 * @param {string} origine Nom de la ressource, pour le journal.
 * @returns {Array} La valeur si c'est un tableau, sinon un tableau vide.
 */
export const listeSure = (valeur, origine = 'ressource') => {
    if (Array.isArray(valeur)) return valeur;
    if (valeur && typeof valeur === 'object' && (valeur.error || valeur.message)) {
        console.error(`[API] ${origine} : ${valeur.error || valeur.message}`);
    } else if (valeur !== undefined && valeur !== null) {
        console.error(`[API] ${origine} : réponse inattendue (${typeof valeur}) là où une liste était attendue.`);
    }
    return [];
};

const handleResponse = async (res) => {
    // Un 404 sur une API interne signale presque toujours un désaccord entre le
    // frontend et le serveur : nom de route ou méthode HTTP divergents. Beaucoup
    // d'appels sont écrits `.catch(() => ({ data: null }))`, ce qui transforme
    // l'échec en liste vide et rend le défaut invisible. On le signale ici,
    // avant que le repli de l'appelant ne l'efface.
    if (res.status === 404) {
        console.error(
            `[API] Endpoint introuvable : ${res.url}\n` +
            "→ La route n'existe pas côté serveur, ou la méthode HTTP ne correspond pas. " +
            'Vérifier server/routes/ ; `npm run check-routes` compare les deux.'
        );
    }

    if (res.status === 401 || res.status === 403) {
        // Seule la session de repli hors ligne porte un jeton que le serveur ne
        // peut pas accepter ; rediriger dans ce cas enfermerait l'application
        // dans une boucle de connexion. La condition portait auparavant sur le
        // mode démo tout entier, si bien qu'une session réellement expirée n'y
        // déclenchait aucune déconnexion : l'utilisateur restait « connecté »
        // devant des modules vides ou en erreur, sans rien pour l'en informer.
        if (localStorage.getItem('sirh_token') === DEMO_TOKEN) {
            throw new Error('Non autorisé (session de démonstration hors ligne)');
        }
        handleUnauthorized();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    // Handling 204 No Content
    if (res.status === 204) return { data: null };

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = text;
    }

    if (!res.ok) {
        throw new Error(data.error || data.message || `Erreur: HTTP ${res.status}`);
    }

    return { data };
};

// Jeu de démonstration : réservé au mode démo. Hors de ce mode, ces chiffres
// seraient indiscernables de vraies données RH et fausseraient les décisions.
const getMockDataForUrl = (url) => {
    if (url.includes('dashboard')) return { data: { employees: { total: 150 }, payroll: { total: 45000000 }, performance: { average: 4.2 } } };
    if (url.includes('employees')) return { data: [{ id: '1', firstName: 'Jean', lastName: 'Kouassi', role: 'Developer' }] };
    return { data: [] }; // Return empty array for lists by default
};

// Repli hors mode démo : structure vide, jamais de valeurs inventées.
// L'interface affiche alors « aucune donnée » plutôt que des chiffres faux.
const getEmptyDataForUrl = (url) => {
    if (url.includes('dashboard') || url.includes('stats')) return { data: null };
    return { data: [] };
};

const getFallbackForUrl = (url) => (DEMO_MODE ? getMockDataForUrl(url) : getEmptyDataForUrl(url));

export const api = {
    get: async (url) => {
        try {
            const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            const res = await fetch(fetchUrl, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            // La session expirée a déjà déclenché la redirection : ne pas masquer l'erreur
            if (error.message && error.message.includes('Session expirée')) throw error;
            console.warn(`API GET ${url} indisponible, repli appliqué`, error);
            return getFallbackForUrl(url);
        }
    },
    post: async (url, body) => {
        try {
            const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            const isFormData = body instanceof FormData;
            const headers = getHeaders();
            if (isFormData) delete headers['Content-Type'];

            const res = await fetch(fetchUrl, {
                method: 'POST',
                headers,
                body: isFormData ? body : JSON.stringify(body)
            });
            return await handleResponse(res);
        } catch (error) {
            console.error(`Erreur API POST ${url}:`, error);
            throw error;
        }
    },
    put: async (url, body) => {
        try {
            const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            const isFormData = body instanceof FormData;
            const headers = getHeaders();
            if (isFormData) delete headers['Content-Type'];

            const res = await fetch(fetchUrl, {
                method: 'PUT',
                headers,
                body: isFormData ? body : JSON.stringify(body)
            });
            return await handleResponse(res);
        } catch (error) {
            console.error(`Erreur API PUT ${url}:`, error);
            throw error;
        }
    },
    patch: async (url, body) => {
        try {
            const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            const isFormData = body instanceof FormData;
            const headers = getHeaders();
            if (isFormData) delete headers['Content-Type'];

            const res = await fetch(fetchUrl, {
                method: 'PATCH',
                headers,
                body: isFormData ? body : JSON.stringify(body)
            });
            return await handleResponse(res);
        } catch (error) {
            console.error(`Erreur API PATCH ${url}:`, error);
            throw error;
        }
    },
    delete: async (url, body) => {
        try {
            const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
            const headers = getHeaders();
            const res = await fetch(fetchUrl, {
                method: 'DELETE',
                headers,
                body: body ? JSON.stringify(body) : undefined
            });
            return await handleResponse(res);
        } catch (error) {
            console.error(`Erreur API DELETE ${url}:`, error);
            throw error;
        }
    }
};
