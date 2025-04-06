import api from '../api';

export const getCourses = async () => {
    try {
        const res = await api.get('/api/courses/');
        const data = await res.data;
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const deleteCourse = async (id) => {
    try {
        const res = await api.delete(`/api/courses/delete/${id}/`);
        if (res.status === 204) {
            console.log('Course deleted!');
        } 
        else console.error('Failed to delete course.');
    } catch (error) {
        console.error(error);
    }
};

export const createCourse = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/api/courses/', { description, title });
        if (res.status === 201) {
            console.log('Course created!');
            const newCourse = await res.data;
            return newCourse;
        } 
        else console.error('Failed to create course.');
    } catch (error) {
        console.error(error);
    }
};