import React, { useState, useEffect } from 'react';
import {
    getCourses,
    createCourse,
    deleteCourse,
} from '../services/coursesServices';
import { getUsers } from '../services/usersServices';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        populateCourses();
    }, []);

    useEffect(() => {
        if (error) alert(error);
    }, [error]);

    const populateCourses = async () => {
        const coursesRes = await getCourses();
        const usersRes = await getUsers();
        if (coursesRes.success && usersRes.success) {
            const courses = coursesRes.data;
            const users = usersRes.data;
            setUsers(users);
            const coursesWithTeacherNames = courses.map((course) => {
                const teacher = users.find(
                    (user) => user.id === course.teacher
                );
                return { ...course, teacherName: teacher.username };
            });
            setCourses(coursesWithTeacherNames);
        } else {
            setError(
                coursesRes.error ||
                usersRes.error ||
                'Something went wrong while populating courses'
            );
        }
    };

    // Create course
    const handleCreateCourse = async (e) => {
        setLoading(true);
        e.preventDefault();

        const result = await createCourse({ description, title });
        if (result.success) {
            const newCourse = result.data;
            const teacherName = users.find(
                (user) => user.id === newCourse.teacher
            ).username;

            setCourses((courses) => [
                ...courses,
                { ...newCourse, teacherName },
            ]);
        } else {
            setError(
                result.error || 'Something went wrong while creating course'
            );
        }

        setLoading(false);
    };

    const handleDeleteCourse = async (id) => {
        setLoading(true);

        const result = await deleteCourse(id);
        if (result.success) {
            setCourses((courses) => courses.filter((el) => el.id !== id));
        } else {
            setError(
                result.error || 'Something went wrong while deleting course'
            );
        }

        setLoading(false);
    };

    return (
        <div>
            <div>
                <h2>Courses</h2>
                {courses.map((course) => {
                    return (
                        <div key={`course-${course.id}`}>
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <p>Teacher: {course.teacherName}</p>
                            <button
                                onClick={() => handleDeleteCourse(course.id)}
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
            <div>
                <h2>Create course</h2>
                <form onSubmit={handleCreateCourse}>
                    <label htmlFor='title'>Title:</label>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        required
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                    />
                    <br />
                    <label htmlFor='description'>Description:</label>
                    <textarea
                        type='text'
                        id='description'
                        name='description'
                        required
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                    ></textarea>
                    <br />
                    <input type='submit' value='Submit' />
                </form>
            </div>
        </div>
    );
}
