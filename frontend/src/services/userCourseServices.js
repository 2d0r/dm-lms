import api from '../api';

export const getUserCourses = async ({ userId, userRole }) => {
    try {
        const result = await api.get(`/api/users/${userId}/courses/?role=${userRole.toLowerCase()}`);
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const updateUserCourses = async ({ userId, courseIds=[], role }) => {
    try {
        const result = await api.patch(`/api/users/${userId}/courses/?role=${role}`, { courseIds });
        return { success: true, data: result.data };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message }
    }
}

export const enrollSelf = async (courseId) => {
    try {
        const result = await api.post(`api/courses/${courseId}/users/me/`);
        return { success: true, status: result.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}

export const unenrollSelf = async (courseId) => {
    try {
        const result = await api.delete(`api/courses/${courseId}/users/me/`);
        return { success: true, status: result.status };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.response?.data || error.message };
    }
}
