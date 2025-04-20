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

export const getUsersByRole = async (role) => {
    try {
        const res = await api.get(`/api/users/?role=${role}`);
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const deleteUser = async (id) => {
    try {
        const res = await api.delete(`/api/users/delete/${id}/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const enrollSelf = async (courseId) => {
    try {
        const res = await api.post(`api/courses/${courseId}/enroll/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const unenrollSelf = async (courseId) => {
    try {
        const res = await api.delete(`api/courses/${courseId}/unenroll/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const enrollUser = async (courseId, userId) => {
    try {
        const res = await api.post(`api/courses/${courseId}/enroll/${userId}`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const unenrollUser = async (courseId, userId) => {
    try {
        const res = await api.delete(`api/courses/${courseId}/unenroll/${userId}/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const createUser = async ({ name, username, password, role }) => {
    try {
        const res = await api.post('/api/users/create/', {
            username, password,
            first_name: name,
            profile: { role: role.toUpperCase() },
        });
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateUser = async ({ id, name, username, password, role }) => {
    try {
        const payload = { first_name: name, username, role };
        if (password) payload.password = password;
        
        const res = await api.patch(`/api/users/update/${id}/`, payload);
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateUserEnrollments = async ({ userId, courseIds }) => {
    try {
        const res = await api.patch(`/api/users/${userId}/enrollments/`, { courseIds });
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}