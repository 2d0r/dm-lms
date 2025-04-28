import api from '../api';

export const getCourses = async () => {
    try {
        const result = await api.get('/api/courses/');
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const getCourse = async (id) => {
    try {
        const result = await api.get(`/api/courses/${id}/`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const createCourse = async ({ description, title, teacherId }) => {
    const payload = {title, description, teacher: teacherId};

    try {
        const result = await api.post('/api/courses/', payload);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateCourse = async ({ id, description, title, teacherId='', studentIds }) => {

    const payload = { teacher: teacherId };
    if (title) payload.title = title;
    if (description) payload.description = description;
    if (studentIds) payload.enrolled_students = studentIds;

    try {
        const result = await api.patch(`/api/courses/${id}/`, payload);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const deleteCourse = async (id) => {
    try {
        const result = await api.delete(`/api/courses/${id}/`);
        return { success: true, status: result.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};
