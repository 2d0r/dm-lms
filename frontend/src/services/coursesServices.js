import api from '../api';

export const getCourses = async () => {
    try {
        const res = await api.get('/api/courses/');
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const getCourse = async (id) => {
    try {
        const res = await api.get(`/api/courses/${id}`);
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const createCourse = async ({ description, title }) => {
    try {
        const res = await api.post('/api/courses/create/', { description, title });
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateCourse = async ({ id, description, title }) => {
    try {
        const res = await api.patch(`/api/courses/update/${id}/`, { description, title });
        return { success: true, data: res.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const deleteCourse = async (id) => {
    try {
        const res = await api.delete(`/api/courses/delete/${id}/`);
        return { success: true, status: res.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

