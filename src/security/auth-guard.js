import { Navigate } from 'react-router-dom';
import { decodeToken, getSession } from '../utils/authUtils';

const ALLOWED_API_ROLE_ID = null;

export const checkAuth = (token, requiredRole, isApiPanel = false) => {
    const defaultRedirect = requiredRole === '1' ? '/admin/login' : isApiPanel || requiredRole === 'api' ? '/api-panel/login' : '/member/login';

    if (!token) return { isAuth: false, redirect: defaultRedirect };

        const session = getSession();
    if (!session || !session.sessionId) {
        return { isAuth: false, redirect: defaultRedirect };
    }

    const decoded = decodeToken(token);
    if (!decoded) return { isAuth: false, redirect: defaultRedirect };

        const userRole = String(
        decoded.role || 
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
        ''
    );

        if (isApiPanel || requiredRole === 'api') {
        if (userRole === '1') {
            return { isAuth: false, redirect: '/admin/dashboard' };
        }
                        if (session.isApiUser !== true) {
            return { isAuth: false, redirect: '/api-panel/login' };
        }
        if (ALLOWED_API_ROLE_ID !== null && userRole !== String(ALLOWED_API_ROLE_ID)) {
            return { isAuth: false, redirect: '/member/dashboard' };
        }
        return { isAuth: true };
    }

    const targetRole = String(requiredRole);

    if (targetRole === '1') {
                if (userRole !== '1') {
            return { isAuth: false, redirect: '/member/dashboard' };
        }
        return { isAuth: true };
    }

                        if (userRole === '1') {
        return { isAuth: false, redirect: '/admin/dashboard' };
    }

            if (session.isApiUser === true) {
        return { isAuth: false, redirect: '/member/login' };
    }

    return { isAuth: true };
};

export const AuthGuard = ({ children, role }) => {
    const isApiPanel = window.location.pathname.startsWith('/api-panel');
    
        const token = role === '1' 
        ? (sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token'))
        : isApiPanel
        ? (sessionStorage.getItem('api_token') || localStorage.getItem('api_token') || sessionStorage.getItem('access_token') || localStorage.getItem('access_token'))
        : (sessionStorage.getItem('access_token') || localStorage.getItem('access_token'));
        
    const status = checkAuth(token, role, isApiPanel);

    if (!status.isAuth) {
        return <Navigate to={status.redirect} replace />;
    }
    return children;
};
