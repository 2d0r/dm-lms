import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EditableCourseRow from '../components/editableCourseRow/EditableCourseRow';
import '@testing-library/jest-dom';

vi.mock('../context/SessionContext', () => ({
    useSession: () => ({
        loadedCourses: [],
        loadedUsers: [
            { id: '1', first_name: 'Alice' },
            { id: '2', first_name: 'Bob' },
        ],
        userState: { id: '123', name: 'Test Teacher', role: 'ADMIN' },
        selectionModal: {},
        setSelectionModal: vi.fn(),
        setError: vi.fn(),
        setLoadedCourses: vi.fn(),
    }),
}));

vi.mock('../hooks/courseHooks', () => ({
    useGetCourseDisplayData: () => vi.fn(),
}));

vi.mock('../services/coursesServices', () => ({
    createCourse: vi.fn().mockResolvedValue({
        success: true,
        data: {
            id: '1',
            title: 'New Course',
            description: 'Updated description',
            teacher: '123',
            enrolled_students: [],
        },
    }),
    updateCourse: vi.fn().mockResolvedValue({
        success: true,
        data: {
            id: '1',
            title: 'New Course',
            description: 'Updated description',
            teacher: '123',
            enrolled_students: [],
        },
    }),
}));

describe('EditableCourseRow', () => {
    const baseProps = {
        course: {
            id: 'course1',
            title: 'Math',
            description: 'Algebra basics',
            teacher: '1',
            teacherName: 'Alice',
            enrolled_students: ['2'],
            enrolledStudentsNames: ['Bob'],
        },
        onCancelCreate: vi.fn(),
        onCreatedCourse: vi.fn(),
        onEditedCourse: vi.fn(),
    };
    const basePropsNew = {
        course: { 
            id: undefined,
            title: 'New Course',
            description: 'Test description',
            teacher: '1',
            enrolled_students: [],
        },
        onCancelCreate: vi.fn(),
        onCreatedCourse: vi.fn(),
        onEditedCourse: vi.fn(),
    };

    test('renders input fields with provided course data', () => {
        render(<EditableCourseRow {...baseProps} />);
        expect(screen.getByLabelText(/Edit Title/)).toHaveValue('Math');
        expect(screen.getByLabelText(/Edit Description/)).toHaveValue(
            'Algebra basics'
        );
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('updates input field values on user input', () => {
        render(<EditableCourseRow {...baseProps} />);
        fireEvent.change(screen.getByLabelText(/Edit Title/), {
            target: { value: 'Science' },
        });
        expect(screen.getByLabelText(/Edit Title/)).toHaveValue('Science');
    });

    test('calls onEditedCourse when Save is clicked for an existing course', async () => {
        const mockOnEdited = vi.fn();
        render(<EditableCourseRow {...baseProps} onEditedCourse={mockOnEdited}/>);
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(mockOnEdited).toHaveBeenCalled();
        });
    });

    test('calls onEditedCourse when Save is clicked for a new course', async () => {
        const mockOnEdited = vi.fn();
        const mockOnCreated = vi.fn();
        render(<EditableCourseRow {...basePropsNew} onCreatedCourse={mockOnCreated} onEditedCourse={mockOnEdited} />);
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(mockOnCreated).toHaveBeenCalled();
        });
    });

    test('calls onCancelCreate when cancel is clicked', () => {
        render(<EditableCourseRow {...baseProps} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(baseProps.onCancelCreate).toHaveBeenCalled();
    });

    test('opens Selection Modal when Edit Teacher box is clicked', () => {
        render(<EditableCourseRow {...baseProps} />);
        fireEvent.click(screen.getByText('Edit Teacher'));
        expect(screen.getByTestId('selection-modal')).toBeInTheDocument();
    });

    test('opens Selection Modal when Edit Students box is clicked', () => {
        render(<EditableCourseRow {...baseProps} />);
        fireEvent.click(screen.getByText('Edit Students'));
        expect(screen.getByTestId('selection-modal')).toBeInTheDocument();
    });
});
