// Users API
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
