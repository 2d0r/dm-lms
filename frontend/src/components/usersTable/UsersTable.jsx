import React, { useEffect, useState } from 'react';
import { deleteUser } from '../../services/usersServices';
import './UsersTable.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import EditableUserRow from '../../components/editableUserRow/EditableUserRow';
import { useSession } from '../../context/SessionContext';
import Popup from '../../components/popup/popup';
import { DEFAULT_POPUP_STATE } from '../../lib/constants';
import LoadingAnimation from '../loadingAnimation/LoadingAnimation';

export default function UsersTable() {
    const { 
        loadCourses, loadUsers, userState, setSelectionModal, 
        setError, loading, setLoading 
    } = useSession();
    const [usersForDisplay, setUsersForDisplay] = useState([]);
    const [courses] = useState([]);
    const [editableUserId, setEditableUserId] = useState(null);
    const [showNewUserRow, setShowNewUserRow] = useState(false);
    const [popup, setPopup] = useState(DEFAULT_POPUP_STATE);

    useEffect(() => {
        setLoading(true);
        populateUsers();
        setLoading(false);
    }, []);

    useEffect(() => {
        console.log('loading', loading)
    }, [loading])

    const fiterCoursesForUser = (user, courses) => {
        if (user.profile?.role === 'STUDENT') {
            return courses
                .filter(el => el.enrolled_students.includes(user.id))
                .map(el => ({ title: el.title, id: el.id }));
        } else if (user.profile?.role === 'TEACHER') {
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
            buttonLabels: ['Yes, delete', 'No, cancel'],
            buttonOnClicks: [
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

    return loading ? <LoadingAnimation /> : (<>
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
                    <div className='row fade-in' key={`user-${user.id}`}>
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
            className='floating-button fade-in'
            onClick={() => setShowNewUserRow(true)}
        >
            Add User
        </button>
        <Popup 
            show={popup.show}
            title={popup.title} text={popup.text} 
            buttonLabels={popup.buttonLabels}
            buttonOnClicks={popup.buttonOnClicks}
        />
    </>);
}
