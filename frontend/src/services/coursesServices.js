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
        const result = await api.post('/api/courses/create/', payload);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateCourse = async ({ id, description, title, teacherId, studentIds }) => {

    const payload = {};
    if (title) payload.title = title;
    if (description) payload.description = description;
    if (teacherId) payload.teacher = teacherId;
    if (studentIds) payload.enrolled_students = studentIds;

    try {
        const result = await api.patch(`/api/courses/update/${id}/`, payload);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const deleteCourse = async (id) => {
    try {
        const result = await api.delete(`/api/courses/delete/${id}/`);
        return { success: true, status: result.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
};

export const getUserCourses = async ({ userId, userRole }) => {
    try {
        const result = await api.get(`/api/users/${userId}/courses/?role=${userRole.toLowerCase()}`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}
