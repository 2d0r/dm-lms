import React, { useEffect, useState } from 'react';
import { deleteUser, getUsers } from '../../services/usersServices';
import Layout from '../../components/layout/Layout';
import './ManageUsers.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import { getCourses } from '../../services/coursesServices';
import EditableUserRow from '../../components/editable-user-row/EditableUserRow';
import SelectionModal from '../../components/selection-modal/SelectionModal';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editableUserId, setEditableUserId] = useState(null);
    const [showNewUserRow, setShowNewUserRow] = useState(false);
    const [selectionModal, setSelectionModal] = useState({ type: '', selectedIds: [], id: null });

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if(courses.length) {
            populateUsers();
        }
    }, [courses]);

    const getCoursesForUser = (user, courses) => {
        if (user.profile.role === 'STUDENT') {
            return courses
                .filter(el => el.enrolled_students.includes(user.id))
                .map(el => ({ title: el.title, id: el.id }));
        } else if (user.profile.role === 'TEACHER') {
            return courses
                .filter(el => el.teacher === user.id)
                .map(el => ({ title: el.title, id: el.id }));
        }
        return [];
    };

    const populateUsers = async () => {
        const res = await getUsers();
        if (res.success) {
            const newUsers = res.data;
            const newUsersWithCourseNames = newUsers.map(user => {
                const coursesForUser = getCoursesForUser(user, courses);
                return {
                    ...user,
                    courseNames: coursesForUser.map(el => el.title),
                    courseIds: coursesForUser.map(el => el.id),
                }
                
            });
            setUsers(newUsersWithCourseNames);
        } else {
            alert(res.error || 'Something went wrong while populating users');
        }
    };

    const loadCourses = async () => {
        const res = await getCourses();
        if (res.success) {
            setCourses(res.data);
        } else {
            alert(res.error || 'Something went wrong while populating users');
        }
    };

    const handleDeleteUser = async id => {
        if (id === Number(currentUserId)) {
            return;
        }
        const result = await deleteUser(id);
        if (result.success) {
            setUsers(users => users.filter(el => el.id !== id));
        } else {
            setError(
                result.error || 'Something went wrong while deleting user'
            );
        }
    };

    const handleCreatedUser = newCourse => {
        populateUsers({
            refetch: false,
            updatedCourses: [...courses, newCourse],
        });
        setShowNewUserRow(false);
    };

    const handleEditedUser = (updatedCourse, idx) => {
        // const unchangedCourses = courses.filter(el => el.id !== updatedCourse.id);
        populateUsers({
            refetch: false,
            updatedCourses: [
                ...courses.slice(0, idx),
                updatedCourse,
                ...courses.slice(idx + 1),
            ],
        });
        setEditableUserId(null);
        setShowNewUserRow(false);
    };

    const handleCancelEdit = () => {
        setEditableUserId(null);
        setShowNewUserRow(false);
    };

    return (<>
        {selectionModal.id && (
            <SelectionModal 
                type={selectionModal.type}
                selectedIds={selectionModal.selectedIds}
                id={selectionModal.id}
                onCloseModal={() => setSelectionModal({type: '', selectedIds: [], id: null})}
            />
        )}
        <Layout>
            <div className='users-table floating-rows'>
                {users.map(user => {
                    if (user.id === editableUserId) {
                        return (
                            <EditableUserRow
                                key={`user-${user.id}`}
                                user={user}
                                onCancelCreate={handleCancelEdit}
                                onEditedUser={updatedUser =>
                                    handleEditedUser(updatedUser, idx)
                                }
                                onEditCourses={({type, id, selectedIds}) => setSelectionModal({type, id, selectedIds})}
                            />
                        );
                    }
                    return (
                        <div className='row' key={`user-${user.id}`}>
                            <div className='name'>
                                <label>Name</label>
                                {user.first_name || 'N/A'}
                            </div>
                            <div className='username'>
                                <label>Username</label>
                                {user.username}
                            </div>
                            <div className='role'>
                                <label>Role</label>
                                {user.profile?.role || 'Loading...'}
                            </div>
                            <div className='courses'>
                                <label>Courses</label>
                                {user.courseNames.join(', ') || 'N/A'}
                            </div>
                            <div className='buttons'>
                                <button
                                    onClick={() => setEditableUserId(user.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={
                                        user.id === Number(currentUserId)
                                            ? 'disabled'
                                            : ''
                                    }
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
                {showNewUserRow && (
                    <EditableUserRow
                        onCancelCreate={() => setShowNewUserRow(false)}
                        onCreatedUser={handleCreatedUser}
                        onEditCourses={({type, id, selectedIds}) => setSelectionModal({type, id, selectedIds})}
                    />
                )}
            </div>
            <button
                className='floating-button'
                onClick={() => setShowNewUserRow(true)}
            >
                Add User
            </button>
        </Layout>
    </>);
}
