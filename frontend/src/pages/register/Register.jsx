import React from 'react';
import AuthForm from '../../components/authForm/AuthForm';

export default function Register() {
    return (
        <section className='form-overlay'>
            <AuthForm route='/api/users/' method='register' />
        </section>
    );
}
