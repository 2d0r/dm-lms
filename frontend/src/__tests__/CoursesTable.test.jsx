import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CoursesTable from '../components/coursesTable/CoursesTable';
import { useSession } from '../context/SessionContext';
import { useGetCourseDisplayData } from '../hooks/courseHooks';
import '@testing-library/jest-dom';
import { DEFAULT_SELECTION_MODAL_STATE } from '../lib/constants';

vi.mock('../context/SessionContext', () => ({
    useSession: vi.fn(),
}));

vi.mock('../hooks/courseHooks', () => ({
    useGetCourseDisplayData: vi.fn(),
}));

const mockCourses = [
    {
        id: 1,
        title: 'Math 101',
        teacher: 2,
        teacherName: 'Mr. Smith',
        enrolled_students: [3],
        enrolledStudentsNames: ['Alice'],
        description: 'Intro to math',
    },
];

const mockUsers = [
    { id: 2, name: 'Mr. Smith' },
    { id: 3, name: 'Alice' },
];

const mockSession = {
    loadCourses: vi.fn().mockResolvedValue(mockCourses),
    loadUsers: vi.fn().mockResolvedValue(mockUsers),
    loadUserCourses: vi.fn().mockResolvedValue(mockCourses),
    userState: { id: 2, role: 'TEACHER' },
    setSelectionModal: vi.fn(),
    setError: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    loadedCourses: mockCourses,
    selectionModal: DEFAULT_SELECTION_MODAL_STATE,
};

const mockGetCourseDisplayData = vi.fn(course => ({
    ...course,
    teacherName: 'Mr. Smith',
    enrolledStudentsNames: ['Alice'],
}));

describe('CoursesTable', () => {
    beforeEach(() => {
        useSession.mockReturnValue(mockSession);
        useGetCourseDisplayData.mockReturnValue(mockGetCourseDisplayData);
    });

    test('renders course data', async () => {
        render(<CoursesTable />);
        expect(await screen.findByText('Math 101')).toBeInTheDocument();
        expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Intro to math')).toBeInTheDocument();
    });

    test('clicking "Create Course" shows EditableCourseRow', async () => {
        render(<CoursesTable />);
        fireEvent.click(screen.getByText('Create Course'));
        expect(await screen.findByLabelText(/Title/i)).toBeInTheDocument();
    });

    test('clicking "Delete" shows confirmation popup', async () => {
        render(<CoursesTable />);
        fireEvent.click(await screen.findByText('Delete'));
        expect(
            screen.getByText('Are you sure you want to delete this course?')
        ).toBeInTheDocument();
    });
});
