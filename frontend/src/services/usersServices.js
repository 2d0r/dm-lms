import api from '../api';

export const getUsers = async () => {
    try {
        const res = await api.get('/api/users/');
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const getUser = async (id) => {
    try {
        const res = await api.get(`/api/users/${id}/`);
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const deleteUser = async (id) => {
    try {
        const res = await api.delete(`/api/users/delete/${id}/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}