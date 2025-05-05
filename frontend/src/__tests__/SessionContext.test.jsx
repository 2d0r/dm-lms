import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import SessionProvider, { useSession } from '../context/SessionContext';
import React from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';

vi.mock('../api', () => ({
    default: {
        get: vi.fn(),
    },
}));

const TestComponent = () => {
    const session = useSession();
    return (
        <div>
            <span data-testid='user-role'>{session.userState.role}</span>
            <span data-testid='user-id'>{session.userState.id}</span>
        </div>
    );
};

describe('SessionContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    test('loads user details if token is present', async () => {
        localStorage.setItem(ACCESS_TOKEN, 'mock-token');
        api.get.mockResolvedValue({
            data: {
                id: 123,
                first_name: 'Tudor',
                profile: { role: 'admin' },
            },
        });

        const { getByTestId } = render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user-role').textContent).toBe('admin');
            expect(getByTestId('user-id').textContent).toBe('123');
        });
    });

    test('does not load user details if token is missing', async () => {
        const { getByTestId } = render(
            <SessionProvider>
                <TestComponent />
            </SessionProvider>
        );

        await waitFor(() => {
            expect(getByTestId('user-role').textContent).toBe('');
            expect(getByTestId('user-id').textContent).toBe('');
        });
    });
});
