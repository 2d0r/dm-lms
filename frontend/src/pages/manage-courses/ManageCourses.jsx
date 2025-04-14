import React, { useEffect, useState } from 'react';
import './ManageCourses.css';
import '../../styles/floatingRows.css';
import Layout from '../../components/layout/Layout';
import { getCourses } from '../../services/coursesServices';
import { getUsers } from '../../services/usersServices';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);

    const currentUser = {
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole'),
        id: localStorage.getItem('userId'),
    };

    useEffect(() => {
        populateCourses(currentUser.name);
    }, []);

    const populateCourses = async () => {
        const coursesRes = await getCourses();
        if (!coursesRes.success) {
            alert(
                coursesRes.error ||
                    usersRes.error ||
                    'Something went wrong while fetching courses'
            );
            return;
        }

        // Populate enrolled students
        // Get teacher name
        const usersRes = await getUsers();
        if (usersRes.success) {
            const users = usersRes.data;
            const courses = coursesRes.data;
            const coursesWithTeacherNames = courses.map(course => {
                const enrolledStudentsNames = users
                    .filter(user => course.enrolled_students.includes(user.id))
                    .map(user => user.first_name);
                const teacherName = users.find(user => user.id === course.teacher).first_name;
                return { ...course, teacherName, enrolledStudentsNames };
            });
            setCourses(coursesWithTeacherNames);
        } else {
            alert(
                coursesRes.error ||
                    usersRes.error ||
                    'Something went wrong while fetching users'
            );
            return;
        }
    };

    const handleDeleteCourse = async (courseId) => {
        setLoading(true);
        const result = await deleteCourse(courseId);
        if (result.success) {
            setCourses(courses => courses.filter(el => el.id !== courseId));
        } else {
            setError(
                result.error || 'Something went wrong while deleting course'
            );
        }
        setLoading(false);
    };

    return (
        <Layout>
            <div className='courses-table floating-rows'>
                {courses.map((course, idx) => {
                    return (
                        <div className='row' key={`course-${idx}`}>
                            <div className='title'>
                                <label>Title</label>
                                {course.title}
                            </div>
                            <div className='teacher'>
                                <label>Teacher</label>
                                {course.teacherName}
                            </div>
                            <div className='students'>
                                <label>Students</label>
                                {course.enrolledStudentsNames.join(', ')}
                            </div>
                            <div className='description'>
                                <label>Description</label>
                                {course.description}
                            </div>
                            <div className='buttons'>
                                <button>Edit</button>
                                <button onClick={handleDeleteCourse}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
}
