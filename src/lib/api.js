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

const handleResponse = async (res) => {
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

const getMockDataForUrl = (url) => {
    if (url.includes('dashboard')) return { data: { employees: { total: 150 }, payroll: { total: 45000000 }, performance: { average: 4.2 } } };
    if (url.includes('employees')) return { data: [{ id: '1', firstName: 'Jean', lastName: 'Kouassi', role: 'Developer' }] };
    return { data: [] }; // Return empty array for lists by default
};

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
            console.warn(`Fallback Démo API GET ${url}`, error);
            return getMockDataForUrl(url);
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
