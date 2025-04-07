import api from '../api';

export const getUsers = async () => {
    try {
        const res = await api.get('/api/users/');
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const getUser = async (id) => {
    try {
        const res = await api.get(`/api/users/${id}`);
        return { succeess: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}