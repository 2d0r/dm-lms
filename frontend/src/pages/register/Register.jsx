import React from 'react';
import Form from '../../components/form/Form';

export default function Register() {
    return (
        <section className='form-overlay'>
            <Form route='/api/user/register/' method='register' />
        </section>
    );
}
