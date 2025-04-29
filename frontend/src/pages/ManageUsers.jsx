import React from 'react';
import Layout from '../components/layout/Layout';
import UsersTable from '../components/usersTable/UsersTable';
import { useSession } from '../context/SessionContext';
import LoadingAnimation from '../components/loadingAnimation/LoadingAnimation';

export default function ManageUsers() {

    const { loading } = useSession();

    return (
        <Layout>
            {loading ? <LoadingAnimation /> 
                : <UsersTable />
            }
        </Layout>
    );
}
