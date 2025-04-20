import React, { useEffect, useState } from 'react';
import './SelectionModal.css';
import { getUsersByRole, updateUserEnrollments } from '../../services/usersServices';
import { getCourses, updateCourseStudents, updateCourseTeacher } from '../../services/coursesServices';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { useSession } from '../../context/SessionContext';

export default function SelectionModal({ type, selectedIds, id, onCloseModal }) {

    const [title, setTitle] = useState('');
    const [list, setList] = useState([]);
    const { reloadCourse, reloadUser, setError } = useSession();

    const populateTeachers = async () => {
        const res = await getUsersByRole('TEACHER');
        if (res.success) {
            const teachers = res.data;
            setList(teachers.map(teacher => ({ 
                id: teacher.id,
                name: teacher.first_name, 
                check: selectedIds.includes(teacher.id),
            })));
        }
    };

    const populateStudents = async () => {
        const res = await getUsersByRole('STUDENT');
        if (res.success) {
            const students = res.data;
            setList(students.map(student => ({ 
                id: student.id,
                name: student.first_name, 
                check: selectedIds.includes(student.id),
            })));
        }
    };

    const populateCourses = async () => {
        const res = await getCourses();
        if (res.success) {
            const courses = res.data;
            setList(courses.map(course => ({ 
                id: course.id,
                name: course.title, 
                check: selectedIds.includes(course.id),
            })));
        }
    };

    const handleSubmitNewCourseTeacher = async () => {
        // Set new teacher for course
        const selectedTeacherId = list.find(el => el.check === true).id;
        // Don't update database if the same teacher is selected
        if (selectedIds.includes(selectedTeacherId)) {
            return;
        }
        const res = await updateCourseTeacher({ courseId: id, teacherId: selectedTeacherId });
        if (!res.success) {
            setError(res.error || 'Something went wrong while changing course\'s teacher');
        }
        await reloadCourse(id);
    }

    const handleSubmitNewCourseStudents = async () => {
        const selectedStudentIds = list.filter(el => el.check === true).map(el => el.id);
        // Don't update database if the selection is the same
        if (selectedIds === selectedStudentIds) {
            return;
        }
        const res = await updateCourseStudents({ courseId: id, studentIds: selectedStudentIds });
        if (!res.success) {
            setError(res.error || 'Something went wrong while changing course\'s students');
        }
        await reloadCourse(id);
    }

    const handleSubmitNewStudentEnrollments = async () => {
        const selectedCourseIds = list.filter(el => el.check === true).map(el => el.id);
        // Don't update database if the selection is the same
        if (selectedIds === selectedCourseIds) {
            return;
        }
        const res = await updateUserEnrollments({ userId: id, courseIds: selectedCourseIds });
        if (!res.success) {
            setError(res.error || 'Something went wrong while updating user\'s enrollments');
        }
        await reloadUser(id);
    }

    useEffect(() => {
        console.log('type', type)
        switch (type) {
            case 'selectTeacher':
                setTitle('Select Teacher');
                populateTeachers();
                break;
            case 'selectStudents':
                setTitle('Select Students');
                populateStudents();
                break;
            case 'selectCoursesForTeacher':
                setTitle('Select Courses');
                populateCourses();
                break;
            case 'selectCoursesForStudent':
                setTitle('Select Courses');
                populateCourses();
                break;
            default:
                setTitle('');
                break;
        }
    }, []);

    const handleCheckbox = (idx) => {
        setList(prevList => {
            let newList = prevList;
            // For unique selection, remove all other checked options
            if (type === 'selectTeacher') {
                newList.forEach((el, idx) => {
                    newList[idx].check = false;
                });
            }
            return [
                ...newList.slice(0, idx), 
                {...newList[idx], check: !newList[idx]['check']}, 
                ...newList.slice(idx + 1)
            ];
        });
    }

    const handleSubmit = () => {
        switch (type) {
            case 'selectTeacher':
                handleSubmitNewCourseTeacher();
                break;
            case 'selectStudents':
                // Enroll and unenroll students to/from course
                handleSubmitNewCourseStudents();
                break;
            case 'selectCoursesForTeacher':
                // If teacher, can't currently update without replacing
                break;
            case 'selectCoursesForStudent':
                handleSubmitNewStudentEnrollments();
                break;
            default:
                setTitle('');
                break;
        }
        onCloseModal();
    }

    return (
        <div className='modal-overlay'>
            <div className='selection-modal'>
                <div className='top-bar'>
                    <div className='title'>{title}</div>
                    <div className='close-button' onClick={onCloseModal}><CloseIcon color='white' /></div>
                </div>
                <ul>
                    {list.map((item, idx) => {
                        return <li key={`selectionList-${idx}`}>
                            <div className='name'>{item.name}</div>
                            <div 
                                className={`checkbox${item.check ? ' checked' : ''}`}
                                onClick={() => handleCheckbox(idx)}
                            >
                                {item.check && <DoneIcon color='1c1c1c' />}
                            </div>
                        </li>;
                    })}
                </ul>
                <button className='submit' onClick={handleSubmit}>Done</button>
            </div>
        </div>
    );
}
