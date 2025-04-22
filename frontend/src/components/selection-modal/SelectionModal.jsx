import React, { useEffect, useState } from 'react';
import './SelectionModal.css';
import { getUsersByRole } from '../../services/usersServices';
import { getCourses } from '../../services/coursesServices';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { useSession } from '../../context/SessionContext';
import { callbackToStortByName } from '../../utils';

export default function SelectionModal({ type, selectedIds, id, onUpdatedSelection }) {

    const [title, setTitle] = useState('');
    const [list, setList] = useState([]);
    const [newSelectedIds, setNewSelectedIds] = useState(selectedIds);
    const { setSelectionModal } = useSession();

    useEffect(() => {
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

    useEffect(() => {
        setNewSelectedIds(list.filter(el => el.check === true).map(el => el.id));
    }, [list]);

    const populateTeachers = async () => {
        const res = await getUsersByRole('TEACHER');
        if (res.success) {
            const teachers = res.data;
            setList(teachers.map(teacher => ({ 
                id: teacher.id,
                name: teacher.first_name, 
                check: selectedIds.includes(teacher.id),
            })).sort(callbackToStortByName));
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
            })).sort(callbackToStortByName));
        }
    };

    const populateCourses = async () => {
        const res = await getCourses();
        if (res.success) {
            const courses = res.data;
            setList(
                courses.map(course => ({ 
                    id: course.id,
                    name: course.title, 
                    check: selectedIds.includes(course.id),
                })).sort(callbackToStortByName)
            );
        }
    };

    const closeSelectionModal = () => {
        setSelectionModal(prev => ({...prev, show: false}));
    }
    
    const handleCheckbox = (id, idx) => {
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
                setSelectionModal(prev => ({...prev, selectedIds: newSelectedIds}));
                break;
            case 'selectStudents':
                // Enroll and unenroll students to/from course
                setSelectionModal(prev => ({...prev, selectedIds: newSelectedIds}));
                break;
            case 'selectCoursesForTeacher':
                // If teacher, can't currently update without replacing
                break;
            case 'selectCoursesForStudent':
                setSelectionModal(prev => ({...prev, selectedIds: newSelectedIds}));
                break;
            default:
                setTitle('');
                break;
        }
        onUpdatedSelection({ type, selectedIds: newSelectedIds });
        closeSelectionModal();
    }

    return (
        <div className='modal-overlay'>
            <div className='selection-modal'>
                <div className='top-bar'>
                    <div className='title'>{title}</div>
                    <div className='close-button' onClick={closeSelectionModal}><CloseIcon color='white' /></div>
                </div>
                <ul>
                    {list.map((item, idx) => {
                        return <li key={`selectionList-${idx}`}>
                            <div className='name'>{item.name}</div>
                            <div 
                                className={`checkbox${item.check ? ' checked' : ''}`}
                                onClick={() => handleCheckbox(list.id, idx)}
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
