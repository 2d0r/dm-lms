import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UsersTable from '../components/usersTable/UsersTable';
import '@testing-library/jest-dom';

const mockUsers = [
    {
        id: 1,
        username: 'student1',
        first_name: 'Alice',
        profile: { role: 'STUDENT' },
        courseNames: ['Math', 'Physics'],
    },
    {
        id: 2,
        username: 'teacher1',
        first_name: 'Bob',
        profile: { role: 'TEACHER' },
        courseNames: ['Biology'],
    },
];

const mockCourses = [
    { id: 1, title: 'Math', enrolled_students: [1], teacher: null },
    { id: 2, title: 'Physics', enrolled_students: [1], teacher: null },
    { id: 3, title: 'Biology', enrolled_students: [], teacher: 2 },
];

vi.mock('../context/SessionContext', () => ({
    useSession: () => ({
        loadCourses: vi.fn(() => Promise.resolve(mockCourses)),
        loadUsers: vi.fn(() => Promise.resolve(mockUsers)),
        selectionModal: { show: true, type: '', selectedIds: [], id: undefined },
        setSelectionModal: vi.fn(),
        setError: vi.fn(),
        setLoading: vi.fn(),
        loading: false,
        userState: { id: 999 },
    }),
}));

describe('UsersTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders users and their info', async () => {
        render(<UsersTable />);

        expect(await screen.findByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('student1')).toBeInTheDocument();
        expect(screen.getByText('STUDENT')).toBeInTheDocument();
        expect(screen.getByText('Math, Physics')).toBeInTheDocument();

        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('teacher1')).toBeInTheDocument();
        expect(screen.getByText('TEACHER')).toBeInTheDocument();
        expect(screen.getByText('Biology')).toBeInTheDocument();
    });

    test('clicking "Add User" shows EditableUserRow', async () => {
        render(<UsersTable />);

        const addButton = screen.getByText('Add User');
        fireEvent.click(addButton);

        expect(await screen.findByText('Edit Name')).toBeInTheDocument();
    });

    test('edit and delete buttons are rendered for each user', async () => {
        render(<UsersTable />);

        const editButtons = await screen.findAllByText('Edit');
        const deleteButtons = await screen.findAllByText('Delete');

        expect(editButtons.length).toBe(2);
        expect(deleteButtons.length).toBe(2);
    });
});
