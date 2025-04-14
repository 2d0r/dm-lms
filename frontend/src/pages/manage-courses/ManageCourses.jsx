import React, { useEffect, useState } from 'react';
import './ManageCourses.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import Layout from '../../components/layout/Layout';
import { deleteCourse, getCourses } from '../../services/coursesServices';
import { getUsers } from '../../services/usersServices';
import EditableCourseRow from '../../components/editable-course-row/EditableCourseRow';

export default function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [showCreateCourseRow, setShowCreateCourseRow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editableCourseId, setEditableCourseId] = useState(null);

    useEffect(() => {
        populateCourses({refetch: true});
    }, []);

    const populateCourses = async (options) => {
        let updateCourses = [];
        if (options.refetch && !options.updatedCourses) {
            const coursesRes = await getCourses();
            if (coursesRes.success) {
                updateCourses = coursesRes.data;
            } else {
                alert(
                    coursesRes.error ||
                        usersRes.error ||
                        'Something went wrong while fetching courses'
                );
                return;
            }
        } else {
            updateCourses = options.updatedCourses;
        }
        // Populate enrolled students
        // Get teacher name
        const usersRes = await getUsers();
        if (usersRes.success) {
            const users = usersRes.data;
            setUsers(users);
            const coursesWithTeacherNames = updateCourses.map(course => {
                const enrolledStudentsNames = users
                    .filter(user => course.enrolled_students.includes(user.id))
                    .map(user => user.first_name);
                const teacherName = users.find(user => user.id === course.teacher).first_name;
                return { ...course, teacherName, enrolledStudentsNames };
            });
            setCourses(coursesWithTeacherNames);
        } else {
            alert(
                usersRes.error || 'Something went wrong while fetching users'
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

    const handleClickToCreateCourse = () => {
        setShowCreateCourseRow(true);
    }

    const handleCreatedCourse = (newCourse) => {
        populateCourses({
            refetch: false, 
            updatedCourses: [...courses, newCourse],
        });
        setShowCreateCourseRow(false);
    }

    const handleEditedCourse = (updatedCourse, idx) => {
        // const unchangedCourses = courses.filter(el => el.id !== updatedCourse.id);
        populateCourses({
            refetch: false,
            updatedCourses: [...courses.slice(0, idx), updatedCourse, ...courses.slice(idx + 1)],
        });
        setEditableCourseId(null);
        setShowCreateCourseRow(false);
    }

    const handleCancelCreate = () => {
        setEditableCourseId(null);
        setShowCreateCourseRow(false);
    }

    

    return (
        <Layout>
            <div className='courses-table floating-rows'>
                {courses.map((course, idx) => {
                    if (editableCourseId === course.id) {
                        return (
                            <EditableCourseRow
                                key={`course-${course.id}`}
                                course={course}
                                onCancelCreate={handleCancelCreate}
                                onCreatedCourse={handleCreatedCourse}
                                onEditedCourse={(updatedCourse) => handleEditedCourse(updatedCourse, idx)}
                            />
                        )
                    }
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
                                {course.enrolledStudentsNames?.join(', ') || ''}
                            </div>
                            <div className='description'>
                                <label>Description</label>
                                {course.description}
                            </div>
                            <div className='buttons'>
                                <button onClick={() => setEditableCourseId(course.id)}>Edit</button>
                                <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                            </div>
                        </div>
                    );
                })}
                {showCreateCourseRow && (
                    <EditableCourseRow 
                        onCancelCreate={() => setShowCreateCourseRow(false)}
                        onCreatedCourse={handleCreatedCourse}
                    />
                )}
            </div>
            <button 
                className='floating-button' 
                type='button' 
                onClick={handleClickToCreateCourse}
            >Create Course</button>
        </Layout>
    );
}
