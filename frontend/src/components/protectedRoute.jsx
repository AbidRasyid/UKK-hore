import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    let userRole = localStorage.getItem('userRole');

    if (!userRole) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            userRole = user?.role;
        } catch {
            userRole = null;
        }
    }

    if (!token) {
        return <Navigate to='/login' replace />;
    } 

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to='/login' replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;