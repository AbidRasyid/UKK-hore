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

    const normalizedUserRole = userRole ? userRole.toLowerCase().trim() : '';
    const normalizedAllowed = allowedRoles ? allowedRoles.map((r) => r.toLowerCase().trim()) : null;

    if (!token) {
        return <Navigate to='/login' replace />;
    } 

    if (normalizedAllowed && !normalizedAllowed.includes(normalizedUserRole)) {
        return <Navigate to='/' replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;