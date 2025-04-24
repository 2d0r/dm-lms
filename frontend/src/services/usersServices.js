import api from '../api';

export const getUsers = async () => {
    try {
        const result = await api.get('/api/users/');
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const getUser = async (id) => {
    try {
        const result = await api.get(`/api/users/${id}/`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const getUsersByRole = async (role) => {
    try {
        const result = await api.get(`/api/users/?role=${role}`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const deleteUser = async (id) => {
    try {
        const result = await api.delete(`/api/users/${id}/`);
        return { success: true, status: result.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const createUser = async ({ name, username, password, role }) => {
    try {
        const result = await api.post('/api/users/', {
            username, password,
            first_name: name,
            profile: { role: role.toUpperCase() },
        });
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateUser = async ({ id, name, username, password, role }) => {
    try {
        const payload = { first_name: name, username, role };
        if (password) payload.password = password;
        
        const result = await api.patch(`/api/users/${id}/`, payload);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}