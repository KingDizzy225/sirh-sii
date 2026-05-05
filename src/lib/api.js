const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

export const api = {
    get: async (url) => {
        const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
        const res = await fetch(fetchUrl, {
            method: 'GET',
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    post: async (url, body) => {
        const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
        const res = await fetch(fetchUrl, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    put: async (url, body) => {
        const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
        const res = await fetch(fetchUrl, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    delete: async (url) => {
        const fetchUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
        const res = await fetch(fetchUrl, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};
