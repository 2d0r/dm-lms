import api from '../api';

export const getUsers = async () => {
    try {
        const res = await api.get('/api/users/');
        const data = await res.data;
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getUser = async (id) => {
    try {
        const res = await api.get(`/api/users/${id}`);
        if (res.status === 200) {
            const user = await res.data;
            return user;
        } else {
            console.error('Failed to get teacher by id');
        }
    } catch (error) {
        console.error(error);
    }
}