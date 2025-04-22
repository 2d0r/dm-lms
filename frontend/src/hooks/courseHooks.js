import { useSession } from '../context/SessionContext'
import { getCourse } from '../services/coursesServices';

export const useGetCourseDisplayData = () => {
    const { loadedUsers, setError } = useSession();

    return (course, relatedUsers = []) => {
        const users = relatedUsers.length ? relatedUsers : loadedUsers;

        if (users.length === 0) {
            setError('Failed to get course display info. Users should be loaded before this operation.')
            return { ...course, enrolledStudentsNames: [], teacherName: '' };
        }

        return {
            ...course,
            enrolledStudentsNames: users.filter(el => course.enrolled_students.includes(el.id)).map(el => el.first_name),
            teacherName: users.find(el => el.id === course.teacher).first_name,
        };
    }
}

export const useGetCourseNameFromId = () => {
    const {loadedCourses, setError} = useSession();

    return async (id) => {
        let course = loadedCourses.find(el => el.id === id);
        if (course) {
            return course.title;
        }

        result = await getCourse(id);
        if (!result.success) {
            setError(result.error || 'Something went wrong while getting course');
            return;
        }

        course = result.data;
        return course.title;
    }
}