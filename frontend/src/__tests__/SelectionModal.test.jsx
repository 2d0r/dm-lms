import { describe, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SelectionModal from '../components/selectionModal/SelectionModal';
import * as usersServices from '../services/usersServices';
import * as coursesServices from '../services/coursesServices';
import '@testing-library/jest-dom';

vi.mock('../context/SessionContext', () => ({
    useSession: () => ({
        setSelectionModal: vi.fn(),
    }),
}));

const mockTeachers = [
    { id: 1, first_name: 'Alice' },
    { id: 2, first_name: 'Bob' },
];

const mockStudents = [
    { id: 3, first_name: 'Charlie' },
    { id: 4, first_name: 'Diana' },
];

const mockCourses = [
    { id: 5, title: 'Math' },
    { id: 6, title: 'Science' },
];

describe('SelectionModal', () => {
    beforeEach(() => {
        vi.spyOn(usersServices, 'getUsersByRole').mockImplementation(
            async role => {
                if (role === 'TEACHER')
                    return { success: true, data: mockTeachers };
                if (role === 'STUDENT')
                    return { success: true, data: mockStudents };
                return { success: false };
            }
        );

        vi.spyOn(coursesServices, 'getCourses').mockResolvedValue({
            success: true,
            data: mockCourses,
        });
    });

    test('displays teachers when type is selectTeacher', async () => {
        render(
            <SelectionModal
                type='selectTeacher'
                selectedIds={[]}
                id={1}
                onUpdatedSelection={vi.fn()}
                show={true}
            />
        );
        await screen.findByText('Alice');
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('displays students when type is selectStudents', async () => {
        render(
            <SelectionModal
                type='selectStudents'
                selectedIds={[]}
                id={1}
                onUpdatedSelection={vi.fn()}
                show={true}
            />
        );
        await screen.findByText('Charlie');
        expect(screen.getByText('Diana')).toBeInTheDocument();
    });

    test('displays courses when type is selectCoursesForTeacher', async () => {
        render(
            <SelectionModal
                type='selectCoursesForTeacher'
                selectedIds={[]}
                id={1}
                onUpdatedSelection={vi.fn()}
                show={true}
            />
        );
        await screen.findByText('Math');
        expect(screen.getByText('Science')).toBeInTheDocument();
    });

    test('calls onUpdatedSelection on submit', async () => {
        const mockOnUpdate = vi.fn();
        render(
            <SelectionModal
                type='selectTeacher'
                selectedIds={[]}
                id={1}
                onUpdatedSelection={mockOnUpdate}
                show={true}
            />
        );
        await screen.findByText('Alice');
        fireEvent.click(screen.getAllByRole('button', { name: /done/i })[0]);
        await waitFor(() => {
            expect(mockOnUpdate).toHaveBeenCalled();
        });
    });

    test('modal closes when clicking x', async () => {
        render(
            <SelectionModal
                type='selectTeacher'
                selectedIds={[]}
                id={1}
                onUpdatedSelection={vi.fn()}
                show={true}
            />
        );
        fireEvent.click(screen.getByTestId('close-button'));
        expect(screen.getByTestId('modal-overlay')).not.toHaveStyle({ visibility: 'hidden' });
    });
});
