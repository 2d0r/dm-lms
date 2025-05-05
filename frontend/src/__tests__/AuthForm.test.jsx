import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import AuthForm from '../components/authForm/AuthForm';
import { BrowserRouter } from 'react-router-dom';
import SessionProvider from '../context/SessionContext';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import '@testing-library/jest-dom';

vi.mock('../api');

const renderWithProviders = (ui) => {
    return render(
        <BrowserRouter>
            <SessionProvider>{ui}</SessionProvider>
        </BrowserRouter>
    );
};

test('renders login form correctly', () => {
    renderWithProviders(<AuthForm route='/api/login/' method='login' />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('renders register form correctly', () => {
    renderWithProviders(
        <AuthForm route='/api/register/' method='register' />
    );
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});

test('submits login form', async () => {
    const mockResponse = {
        data: {
            access: ACCESS_TOKEN,
            refresh: REFRESH_TOKEN,
            role: 'STUDENT',
            id: 1,
            first_name: 'Test User',
        },
    };
    api.post.mockResolvedValue(mockResponse);

    renderWithProviders(<AuthForm route='/api/login/' method='login' />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
        target: { value: 'stud' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'pass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
        expect(api.post).toHaveBeenCalledWith('/api/login/', {
            username: 'stud',
            password: 'pass123!',
        })
    );
});

test('shows error on login failure', async () => {
    api.post.mockRejectedValue(new Error('Login failed'));

    renderWithProviders(<AuthForm route='/api/login/' method='login' />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
        target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
        expect(
            screen.getByText(/username or password is incorrect/i)
        ).toBeInTheDocument()
    );
});
