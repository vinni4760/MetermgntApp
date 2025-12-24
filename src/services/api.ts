import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await apiClient.post('/auth/login', { username, password });
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

// Installations API
export const installationsAPI = {
    getAll: async () => {
        const response = await apiClient.get('/installations');
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/installations', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await apiClient.put(`/installations/${id}`, data);
        return response.data;
    },
};

// Upload API
export const uploadAPI = {
    uploadImages: async (files: FileList) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('photos', file);
        });

        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};


// Meters API
export const metersAPI = {
    getAll: async () => {
        const response = await apiClient.get('/meters');
        return response.data;
    },
    assign: async (vendorId: string, quantity: number) => {
        const response = await apiClient.post('/meters/assign', { vendorId, quantity });
        return response.data;
    },
    getStats: async () => {
        const response = await apiClient.get('/meters/stats');
        return response.data;
    },
    getByVendor: async (vendorId: string) => {
        const response = await apiClient.get(`/meters/vendor/${vendorId}`);
        return response.data;
    },
};

// Vendors API
export const vendorsAPI = {
    getAll: async () => {
        const response = await apiClient.get('/vendors');
        return response.data;
    },
    create: async (vendorData: any) => {
        const response = await apiClient.post('/vendors', vendorData);
        return response.data;
    },
    update: async (id: string, updates: any) => {
        const response = await apiClient.put(`/vendors/${id}`, updates);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/vendors/${id}`);
        return response.data;
    },
};

// Users API (Admin only)
export const usersAPI = {
    getAll: async () => {
        const response = await apiClient.get('/users');
        return response.data;
    },
    create: async (userData: any) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },
    update: async (id: string, updates: any) => {
        const response = await apiClient.put(`/users/${id}`, updates);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },
};

export default apiClient;
