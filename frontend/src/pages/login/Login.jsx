import React from 'react';
import Form from '../../components/form/Form';
import './Login.css';

export default function Login() {
    return (
        <section className='form-overlay'>
            <Form route='/api/token/' method='login' />
        </section>
    );
}
