import React from 'react';
import Layout from '../components/layout/Layout';
import CoursesTable from '../components/coursesTable/CoursesTable';
import { useSession } from '../context/SessionContext';
import LoadingAnimation from '../components/loadingAnimation/LoadingAnimation';

export default function ManageCourses() {

    const { loading } = useSession();

    return (
        <Layout>
            {loading ? <LoadingAnimation /> 
                : <CoursesTable />
            }
        </Layout>
    );
}
