import React, { useState, useEffect } from 'react';
import api from '../api';
import { getCourses } from '../services/coursesServices';
import { getUsers } from '../services/usersServices';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        populateCourses();
    }, []);

    const populateCourses = async () => {
        const courses = await getCourses();
        const users = await getUsers();
        console.log(users)
        const coursesWithTeacherNames = courses.map((course) => {
            const teacher = users.find(user => user.id === course.teacher);
            return { ...course, teacherName: teacher.username };
        });
        setCourses(coursesWithTeacherNames);
    };

    const deleteCourse = async (id) => {
        try {
            const res = await api.delete(`/api/courses/delete/${id}/`);
            if (res.status === 204) {
                console.log('Course deleted!');
                setCourses((courses) => courses.filter((el) => el.id !== id));
            } else alert('Failed to delete course.');
        } catch (error) {
            alert(error);
        }
    };

    const createCourse = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/courses/', { description, title });
            if (res.status === 201) {
                console.log('Course created!');
                const newCourse = await res.data;
                setCourses((courses) => [...courses, newCourse]);
            } else alert('Failed to create course.');
        } catch (error) {
            alert(error);
        }
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
                            <button onClick={() => deleteCourse(course.id)}>
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
            <div>
                <h2>Create course</h2>
                <form onSubmit={createCourse}>
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
