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
    try {
        const result = await api.post('/api/courses/create/', { description, title, teacher: teacherId });
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
};

export const updateCourse = async ({ id, description, title }) => {
    try {
        const result = await api.patch(`/api/courses/update/${id}/`, { description, title });
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateCourseTeacher = async ({ courseId, teacherId }) => {
    try {
        const result = await api.patch(`/api/courses/update/${courseId}/`, { teacher: teacherId });
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const updateCourseStudents = async ({ courseId, studentIds }) => {
    try {
        const result = await api.patch(`/api/courses/update/${courseId}/`, { enrolled_students: studentIds });
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