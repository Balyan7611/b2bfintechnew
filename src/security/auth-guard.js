// Route Protection
import { Navigate } from 'react-router-dom';
import { decodeToken, getSession } from '../utils/authUtils';

export const checkAuth = (token, requiredRole) => {
    const defaultRedirect = requiredRole === '1' ? '/admin/login' : '/member/login';

    if (!token) return { isAuth: false, redirect: defaultRedirect };

    // Check if session ID exists in localStorage to prevent route bypass after logout
    const session = getSession();
    if (!session || !session.sessionId) {
        return { isAuth: false, redirect: defaultRedirect };
    }

    const decoded = decodeToken(token);
    if (!decoded) return { isAuth: false, redirect: defaultRedirect };

    // Convert roles to strings to prevent type mismatch, supporting standard C# Claims role URI
    const userRole = String(
        decoded.role || 
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
        ''
    );
    const targetRole = String(requiredRole);

    // Role check: Admin (1) or Member (2)
    if (userRole !== targetRole) {
        return { 
            isAuth: false, 
            redirect: userRole === '1' ? '/admin/dashboard' : '/member/dashboard' 
        };
    }

    return { isAuth: true };
};

export const AuthGuard = ({ children, role }) => {
    // Admin uses 'admin_token' specifically, member uses 'access_token'
    const token = role === '1' 
        ? (sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token'))
        : (sessionStorage.getItem('access_token') || localStorage.getItem('access_token'));
        
    const status = checkAuth(token, role);

    if (!status.isAuth) {
        return <Navigate to={status.redirect} replace />;
    }
    return children;
};