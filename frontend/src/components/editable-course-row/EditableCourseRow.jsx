import React, { useEffect, useState } from 'react';
import { createCourse, updateCourse } from '../../services/coursesServices';
import './EditableCourseRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetCourseDisplayData } from '../../hooks/courseHooks';

export default function EditableCourseRow({ 
    course={}, 
    onCancelCreate, onShowSelectionModal,
    onCreatedCourse, onEditedCourse,
}) {

    const [title, setTitle] = useState(course.title || '');
    const [description, setDescription] = useState(course.description || '');
    const [teacherId, setTeacherId] = useState(course.teacher || '');
    const [teacherName, setTeacherName] = useState(course.teacherName || '');
    const [enrolledStudents, setEnrolledStudents] = useState(course.enrolled_students || []);
    const [enrolledStudentsNames, setEnrolledStudentsNames] = useState(course.enrolledStudentsNames || []);
    const { loadedCourses, reloadCourse, userState, setError } = useSession();
    const getCourseDisplayData = useGetCourseDisplayData();
    const userRole = userState.role;
    const isNewCourse = !course.id;

    const updateCourseForDisplay = () => {
        const newCourse = loadedCourses.find(el => el.id === course.id);
        const courseForDisplay = getCourseDisplayData(newCourse);
        setTitle(courseForDisplay.title);
        setDescription(courseForDisplay.description);
        setTeacherId(courseForDisplay.teacher);
        setTeacherName(courseForDisplay.teacherName);
        setEnrolledStudentsNames(courseForDisplay.enrolledStudentsNames);
        setEnrolledStudents(courseForDisplay.enrolled_students);
    }

    useEffect(() => {
        if (loadedCourses.length && !isNewCourse) updateCourseForDisplay();
        if (userRole === 'TEACHER') {
            setTeacherId(userState.id);
            setTeacherName(userState.name);
        }
    }, []);

    useEffect(() => {
        if (loadedCourses.length && !isNewCourse) updateCourseForDisplay();
    }, [loadedCourses]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        const result = await createCourse({ description, title, teacherId });
        if (result.success) {
            const newCourse = result.data;
            reloadCourse(newCourse.id);
            onCreatedCourse(newCourse);
        } else {
            setError(result.error || 'Something went wrong while creating course');
        }
    };
    const handleEditCourse = async (e) => {
        e.preventDefault();
        const result = await updateCourse({ 
            id: course.id, title, description 
        });
        if (result.success) {
            const udpatedCourse = result.data;
            onEditedCourse(udpatedCourse);
        } else {
            alert(result.error || 'Something went wrong while editing course');
        }
    };
    const handleCancelCreate = () => {
        onCancelCreate();
    };
    const handleEditTeacher = () => {
        if (userRole === 'ADMIN') {
            onShowSelectionModal('selectTeacher', course.id, [teacherId]);
        }
    };
    const handleEditStudents = () => {
        if (userRole === 'ADMIN') {
            onShowSelectionModal('selectStudents', course.id, enrolledStudents);
        }
    };

    return (
        <div id='editable-course-row' className='row editable'>
            <form onSubmit={isNewCourse ? handleCreateCourse : handleEditCourse} >
                <div className='title'>
                    <label htmlFor='title'>Edit Title</label>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        placeholder='New course'
                        required
                        onChange={e => setTitle(e.target.value)}
                        value={title}
                    />
                </div>
                <div className={`teacher${userRole === 'TEACHER' ? ' no-edit' : ''}`} onClick={handleEditTeacher}>
                    <label htmlFor='teacher'>{userRole === 'TEACHER' ? '' : 'Edit '}Teacher</label>
                    {teacherName}
                </div>
                <div className={`students${userRole === 'TEACHER' ? ' no-edit': ''}`} onClick={handleEditStudents}>
                    <label htmlFor='students'>{userRole === 'TEACHER' ? '' : 'Edit '}Students</label>
                    {enrolledStudentsNames.join(', ')}
                </div>
                <div className='description'>
                    <label htmlFor='description'>Edit Description</label>
                    <textarea
                        type='text'
                        id='description'
                        name='description'
                        placeholder='Write a description'
                        required
                        onChange={e => setDescription(e.target.value)}
                        value={description}
                    />
                </div>
                <div className='buttons'>
                    <button type='submit'>Save</button>
                    <button type='button' onClick={handleCancelCreate}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
