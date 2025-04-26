import React, { useEffect, useState } from 'react';
import { deleteUser } from '../../services/usersServices';
import Layout from '../../components/layout/Layout';
import './ManageUsers.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import EditableUserRow from '../../components/editableUserRow/EditableUserRow';
import { useSession } from '../../context/SessionContext';
import Popup from '../../components/popup/popup';
import { DEFAULT_POPUP_STATE } from '../../lib/constants';

export default function ManageUsers() {
    const { loadCourses, loadUsers, userState, setSelectionModal } = useSession();
    const [usersForDisplay, setUsersForDisplay] = useState([]);
    const [courses, setCourses] = useState([]);
    const [editableUserId, setEditableUserId] = useState(null);
    const [showNewUserRow, setShowNewUserRow] = useState(false);
    const [popup, setPopup] = useState(DEFAULT_POPUP_STATE);

    useEffect(() => {
        populateUsers();
    }, []);

    const fiterCoursesForUser = (user, courses) => {
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
        const courses = await loadCourses();
        const newUsers = await loadUsers();
        const newUsersWithCourseNames = newUsers.map(user => {
            const coursesForUser = fiterCoursesForUser(user, courses);
            return {
                ...user,
                courseNames: coursesForUser.map(el => el.title),
                courseIds: coursesForUser.map(el => el.id),
            }
        });
        setUsersForDisplay(newUsersWithCourseNames);
    };

    const handleClickDelete = (userId) => {
        setPopup({ 
            show: true,
            title: 'Delete user',
            text: 'Are you sure you want to delete this user?',
            buttonLabel: ['Yes, delete', 'No, cancel'],
            buttonOnClick: [
                () => {
                    handleDeleteUser(userId);
                    setPopup(DEFAULT_POPUP_STATE);
                },
                () => setPopup(DEFAULT_POPUP_STATE),
            ]
        })
    };
    const handleDeleteUser = async id => {
        if (id === Number(userState.id)) {
            return;
        }
        const result = await deleteUser(id);
        if (result.success) {
            setUsersForDisplay(users => users.filter(el => el.id !== id));
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

    const handleCancel = () => {
        setEditableUserId(null);
        setShowNewUserRow(false);
    };

    return (<>
        <Layout>
            <div className='users-table floating-rows'>
                {usersForDisplay.map((user, idx) => {
                    if (user.id === editableUserId) {
                        return (
                            <EditableUserRow
                                key={`user-${user.id}`}
                                user={user}
                                onEditedUser={updatedUser =>
                                    handleEditedUser(updatedUser, idx)
                                }
                                onEditCourses={(options) => setSelectionModal(options)}
                                onCancel={handleCancel}
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
                                    className={`delete-button${
                                        user.id === Number(userState.id)
                                            ? ' disabled'
                                            : ''
                                    }`}
                                    onClick={() => handleClickDelete(user.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
                {showNewUserRow && (
                    <EditableUserRow
                        onCancel={handleCancel}
                        onCreatedUser={handleCreatedUser}
                        onEditCourses={(options) => setSelectionModal(options)}
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
        {popup.show && (
            <Popup 
                title={popup.title} text={popup.text} 
                buttonLabel={popup.buttonLabel}
                buttonOnClick={popup.buttonOnClick}
            />
        )}
    </>);
}
