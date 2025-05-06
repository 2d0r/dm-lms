import React, { useEffect, useState } from 'react';
import { createUser, updateUser } from '../../services/usersServices';
import { updateUserCourses } from '../../services/userCourseServices';
import './EditableUserRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetUserDisplayData } from '../../hooks/userHooks';
import SelectionModal from '../selectionModal/SelectionModal';
import { useGetCourseNameFromId } from '../../hooks/courseHooks';

export default function EditableUserRow({
    user = { profile: {} }, 
    onCreatedUser, onEditedUser, onEditCourses, onCancel, 
}) {

    const { loadedUsers, reloadUser, selectionModal, setError } = useSession();
    const [name, setName] = useState(user.first_name || '');
    const [username, setUsername] = useState(user.username || '');
    const [role, setRole] = useState(user.profile?.role || 'STUDENT');
    const [password, setPassword] = useState('');
    const [courseIds, setCourseIds] = useState(user.courseIds || []);
    const [courseNames, setCourseNames] = useState(
        user.courseNames || []
    );
    const getUserDisplayData = useGetUserDisplayData();
    const isNewUser = !user.id;
    const getCourseNameFromId = useGetCourseNameFromId();

    const updateUserForDisplay = () => {
        if (isNewUser) {
            return;
        }
        const newUser = loadedUsers.find(el => el.id === user.id);
        const relatedCourses =
            newUser.profile?.role === 'STUDENT'
                ? newUser.courses
                : newUser.courses_taught;
        const userForDisplay = getUserDisplayData(newUser, relatedCourses);
        setName(userForDisplay.name);
        setUsername(userForDisplay.username);
        setRole(userForDisplay.profile?.role);
        setCourseNames(userForDisplay.courseNames);
        // setCourseIds(userForDisplay.courses);
    };

    useEffect(() => {
        updateUserForDisplay();
    }, []);

    useEffect(() => {
        updateUserForDisplay();
    }, [loadedUsers]);

    const handleCreateUser = async e => {
        e.preventDefault();
        const result1 = await createUser({
            name,
            username,
            password,
            role,
        });
        if (!result1.success) {
            setError(result1.error || 'Something went wrong while creating user');
            return;
        }
        const newUserId = result1.data.id;

        const courseSelection = selectionModal.type === 'selectCoursesForStudent' ? selectionModal.selectedIds : null;
        if (courseSelection) {
            const result2 = await updateUserCourses({ userId: newUserId, courseIds: courseSelection, role });
            if (!result2.success) {
                setError(result2.error || 'Something went wrong while changing course\'s teacher');
            }
        }
        
        const newUser = reloadUser(newUserId);
        onCreatedUser(newUser);
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        const result1 = await updateUser({
            id: user.id,
            name,
            username,
            password,
            role,
        });
        if (!result1.success) {
            setError(result1.error || 'Something went wrong while editing user');
        }

        // Unlink courses at role change
        if (role !== user.profile?.role && user.profile.role) {
            await updateUserCourses({ userId: user.id, courseIds: [], role: user.profile.role });
        }

        const courseSelection = selectionModal.selectedIds;
        const result2 = await updateUserCourses({ userId: user.id, courseIds: courseSelection, role });
        if (!result2.success) {
            setError(result2.error || 'Something went wrong while changing course\'s teacher');
        }
        
        updateUserForDisplay();
        const updatedUser = reloadUser(user.id);
        onEditedUser(updatedUser);
    };

    const handleRoleChange = (e) => {
        setCourseIds([]);
        setCourseNames([]);
        setRole(e.target.value);
    }
    
    const handleClickToEditCourses = () => {
        if (role === 'ADMIN') { return; }
        const selectionModalOptions = {
            show: true,
            type:
                role === 'STUDENT'
                    ? 'selectCoursesForStudent'
                    : 'selectCoursesForTeacher',
            selectedIds: courseIds,
            id: user.id || null,
        }
        onEditCourses(selectionModalOptions);
    };

    const handleUpdatedSelection = async ({ type, selectedIds }) => {
        if (type === 'selectCoursesForStudent') {
            setCourseIds(selectedIds);
            const courseNames = await Promise.all(selectedIds.map(async (courseId) => {
                const courseName = await getCourseNameFromId(courseId);
                return courseName || '';
            }));
            setCourseNames(courseNames);
        } else if (type === 'selectCoursesForTeacher') {
            setCourseIds(selectedIds);
            const courseNames = await Promise.all(selectedIds.map(async (courseId) => {
                const courseName = await getCourseNameFromId(courseId);
                return courseName || '';
            }));
            setCourseNames(courseNames);
        }
    }

    const handleCancel = () => {
        onCancel();
    };

    return (<>
        <div id='editable-user-row' className='row editable'>
            <form onSubmit={isNewUser ? handleCreateUser : handleEditUser}>
                <div className='cell name'>
                    <label htmlFor='name'>Edit Name</label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        placeholder='Name'
                        required
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                </div>
                <div className='username-password'>
                    <div className='cell username'>
                        <label htmlFor='username'>Edit Username</label>
                        <input
                            type='text'
                            id='username'
                            name='username'
                            placeholder='Username'
                            required
                            onChange={e => setUsername(e.target.value)}
                            value={username}
                        />
                    </div>
                    <div className='cell password'>
                        <label htmlFor='password'>Edit Password</label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Password'
                            required={isNewUser}
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>
                </div>
                <div className='cell role no-edit'>
                    <label htmlFor='role'>Role</label>
                    {isNewUser ? (
                        <select
                            name='role'
                            id='role'
                            defaultValue={role}
                            onChange={handleRoleChange}
                        >
                            <option value='STUDENT'>STUDENT</option>
                            <option value='TEACHER'>TEACHER</option>
                            <option value='ADMIN'>ADMIN</option>
                        </select>
                    )
                    : role}
                </div>
                <div
                    className={`cell textarea courses${role === 'ADMIN' ? ' no-edit' : ''}`}
                    onClick={handleClickToEditCourses}
                >
                    <label htmlFor='courses'>{
                        role === 'ADMIN' ? 'Courses' : 'Edit Courses'
                    }</label>
                    {courseNames?.join(', ')}
                </div>
                <div className='buttons'>
                    <button type='submit'>Save</button>
                    <button type='button' onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        <SelectionModal 
            show={selectionModal.show}
            type={selectionModal.type}
            selectedIds={selectionModal.selectedIds}
            id={selectionModal.id}
            onUpdatedSelection={handleUpdatedSelection}
        />
    </>);
}
