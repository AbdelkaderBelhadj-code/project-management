import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NotAuthorized from '../components/NotAuthorized';

const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return {
            userId: decoded.UserId || decoded.userId,
            role: decoded.role || decoded.Role || null,
        };
    } catch (error) {
        return null;
    }
};

/**
 * 
 * @param {Object} props 
 * @param {string[]} props.allowedRoles - array of allowed roles to access the route
 * @returns 
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const user = getUserFromToken();

    if (!user) {
        // No user token -> redirect to login
        return <Navigate to="/" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User role is not allowed -> show not authorized
        return <NotAuthorized />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
