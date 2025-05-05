import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CoursesGrid from '../components/coursesGrid/CoursesGrid';
import { useSession } from '../context/SessionContext';
import * as coursesServices from '../services/coursesServices';
import * as usersServices from '../services/usersServices';
import '@testing-library/jest-dom';


vi.mock('../services/coursesServices');
vi.mock('../services/usersServices');
vi.mock('../services/userCourseServices');
vi.mock('../context/SessionContext', () => ({
    useSession: vi.fn(),
}));

describe('CoursesGrid', () => {
    beforeEach(() => {
        useSession.mockReturnValue({
            userState: { id: 1, role: 'STUDENT' },
            loading: false,
            setLoading: vi.fn(),
            setError: vi.fn(),
        });
    });

    test('renders course cards with correct titles and teacher names', async () => {
        coursesServices.getCourses.mockResolvedValue({
            success: true,
            data: [
                {
                    id: 1,
                    title: 'Math',
                    description: 'Algebra basics',
                    teacher: 2,
                    enrolled_students: [1],
                },
            ],
        });
        usersServices.getUsers.mockResolvedValue({
            success: true,
            data: [{ id: 2, first_name: 'Alice' }],
        });

        render(<CoursesGrid />);

        await waitFor(() => {
            expect(screen.getByText('Math')).toBeInTheDocument();
            expect(screen.getByText('prof. Alice')).toBeInTheDocument();
        });
    });

    test('shows enroll button for non-enrolled students', async () => {
        coursesServices.getCourses.mockResolvedValue({
            success: true,
            data: [
                {
                    id: 2,
                    title: 'History',
                    description: 'World history',
                    teacher: 3,
                    enrolled_students: [],
                },
            ],
        });
        usersServices.getUsers.mockResolvedValue({
            success: true,
            data: [{ id: 3, first_name: 'Bob' }],
        });

        render(<CoursesGrid />);

        await waitFor(() => {
            expect(screen.getByText('Enroll')).toBeInTheDocument();
        });
    });

    test('renders loading animation when loading is true', () => {
        useSession.mockReturnValue({
            userState: { id: 1, role: 'STUDENT' },
            loading: true,
            setLoading: vi.fn(),
            setError: vi.fn(),
        });

        render(<CoursesGrid />);
        expect(screen.getByTestId('loading-animation')).toBeInTheDocument();
    });
});
