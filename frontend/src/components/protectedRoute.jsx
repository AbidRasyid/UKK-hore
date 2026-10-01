import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if(!token) {
        return <Navigate to='/login' replace />;
    } 

    if(allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to='/' replace />
    }

    return <Outlet/>;
}

export default ProtectedRoute;