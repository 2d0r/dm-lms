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
        setNewSelectedIds(list.filter(el => el.check === true)?.map(el => el.id) || []);
    }, [list]);

    const populateTeachers = async () => {
        const response = await getUsersByRole('TEACHER');
        if (response.success) {
            const teachers = response.data;
            setList(teachers.map(teacher => ({ 
                id: teacher.id,
                name: teacher.first_name, 
                check: selectedIds.includes(teacher.id),
            })).sort(callbackToStortByName));
        }
    };

    const populateStudents = async () => {
        const response = await getUsersByRole('STUDENT');
        if (response.success) {
            const students = response.data;
            setList(students.map(student => ({ 
                id: student.id,
                name: student.first_name, 
                check: selectedIds.includes(student.id),
            })).sort(callbackToStortByName));
        }
    };

    const populateCourses = async () => {
        const response = await getCourses();
        if (response.success) {
            const courses = response.data;
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
                newList.forEach((el, idx2) => {
                    if (idx !== idx2)
                        newList[idx2].check = false;
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
        console.log('newSelectedIds', newSelectedIds)
        setSelectionModal(prev => ({...prev, selectedIds: newSelectedIds}));
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
