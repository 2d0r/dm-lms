import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import EditableUserRow from '../components/editableUserRow/EditableUserRow';
import '@testing-library/jest-dom';

vi.mock('../context/SessionContext', () => ({
    useSession: () => ({
        loadedCourses: [],
        loadedUsers: [
            { id: '1', first_name: 'Alice' },
            { id: '2', first_name: 'Bob' },
        ],
        userState: { id: '3', name: 'Admin', role: 'ADMIN' },
        selectionModal: {},
        setSelectionModal: vi.fn(),
        setError: vi.fn(),
        setLoadedCourses: vi.fn(),
        reloadUser: vi.fn(),
    }),
}));

vi.mock('../hooks/courseHooks', () => ({
    useGetCourseNameFromId: () => vi.fn(),
}));

vi.mock('../hooks/userHooks', () => ({
    useGetUserDisplayData: () => vi.fn(),
}));

vi.mock('../services/userServices', () => ({
    createUser: vi.fn().mockResolvedValue({
        success: true,
        data: {},
    }),
    updateUser: vi.fn().mockResolvedValue({
        success: true,
        data: {},
    }),
}));

vi.mock('../services/userCourseServices', () => ({
    updateUserCourses: vi.fn().mockResolvedValue({
        success: true,
        data: {},
    }),
}));

describe('EditableUserRow', () => {
    const baseProps = {
        user: {
            first_name: 'Alice',
            username: 'alice',
            profile: { role: 'TEACHER' },
            password: '1',
            courseIds: ['1', '2'],
            courseNames: ['Course 1', 'Course 2'],
        },
        onCancel: vi.fn(),
        onCreatedUser: vi.fn(), 
        onEditedUser: vi.fn(), 
        onEditCourses: vi.fn(),
    };
    const basePropsNew = {
        user: {
            id: undefined,
            first_name: '',
            username: '',
            profile: { role: 'TEACHER' },
            password: '1',
            courseIds: [],
            courseNames: [],
        },
        onCancel: vi.fn(),
        onCreatedUser: vi.fn(), 
        onEditedUser: vi.fn(), 
        onEditCourses: vi.fn(),
    };

    test('renders input fields with provided course data', () => {
        render(<EditableUserRow {...baseProps} />);
        expect(screen.getByLabelText(/Edit Name/)).toHaveValue('Alice');
        expect(screen.getByLabelText(/Edit Username/)).toHaveValue('alice');
        expect(screen.getByLabelText(/Edit Password/)).toHaveValue('');
        expect(screen.getByText('Course 1, Course 2')).toBeInTheDocument();
    });

    test('updates input field values on user input', () => {
        render(<EditableUserRow {...baseProps} />);
        fireEvent.change(screen.getByLabelText(/Edit Username/), {
            target: { value: 'testea2' },
        });
        expect(screen.getByLabelText(/Edit Username/)).toHaveValue('testea2');
    });

    test('opens Selection Modal when courses box is clicked', () => {
        render(<EditableUserRow {...baseProps} />);
        fireEvent.click(screen.getByText('Edit Courses'));
        expect(baseProps.onEditCourses).toHaveBeenCalled();
        expect(screen.getByTestId('selection-modal')).toBeInTheDocument();
    });

    // test('calls onEditedUser when Save is clicked for an existing user', async () => {
    //     const mockOnEdited = vi.fn();
    //     render(<EditableUserRow {...baseProps} onEditedUser={mockOnEdited}/>);
    //     fireEvent.click(screen.getByText('Save'));
    //     await waitFor(() => {
    //         expect(mockOnEdited).toHaveBeenCalled();
    //     });
    // });
    
    // test('calls onCreatedUser when Save is clicked for a new user', async () => {
    //     const mockOnEdited = vi.fn();
    //     const mockOnCreated = vi.fn();
    //     render(<EditableUserRow {...basePropsNew} onCreatedUser={mockOnCreated} onEditedUser={mockOnEdited} />);
    //     fireEvent.change(screen.getByLabelText(/Edit Name/i), {
    //         target: { value: 'Test User' }
    //     });
    //     fireEvent.change(screen.getByLabelText(/Edit Username/i), {
    //         target: { value: 'testuser' }
    //     });
    //     fireEvent.click(screen.getByText('Save'));
    //     await waitFor(() => {
    //         expect(mockOnCreated).toHaveBeenCalled();
    //     });
    // });

    test('calls onCancelCreate when cancel is clicked', () => {
        render(<EditableUserRow {...baseProps} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(baseProps.onCancel).toHaveBeenCalled();
    });
});
