// Route Protection
import { Navigate } from 'react-router-dom';
import { decodeToken, getSession } from '../utils/authUtils';

// FOR FUTURE CONFIGURATION:
// When the specific Role ID for API User is provided by admin, set it below (e.g., const ALLOWED_API_ROLE_ID = '5';)
// Currently set to null to allow all non-admin roles (userRole !== '1').
const ALLOWED_API_ROLE_ID = null;

export const checkAuth = (token, requiredRole, isApiPanel = false) => {
    const defaultRedirect = requiredRole === '1' ? '/admin/login' : isApiPanel || requiredRole === 'api' ? '/api-panel/login' : '/member/login';

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

    // API Panel Role Check
    if (isApiPanel || requiredRole === 'api') {
        if (userRole === '1') {
            return { isAuth: false, redirect: '/admin/dashboard' };
        }
        if (ALLOWED_API_ROLE_ID !== null && userRole !== String(ALLOWED_API_ROLE_ID)) {
            return { isAuth: false, redirect: '/member/dashboard' };
        }
        return { isAuth: true };
    }

    const targetRole = String(requiredRole);

    if (targetRole === '1') {
        // Admin-only route - must be exactly role 1.
        if (userRole !== '1') {
            return { isAuth: false, redirect: '/member/dashboard' };
        }
        return { isAuth: true };
    }

    // Member route: any authenticated non-admin role is valid here (Retailer,
    // Distributor, Master Distributor, Admin-as-member, Unique, etc. all share
    // the same member dashboard) - not just one hardcoded role id. Matching
    // this against a single exact role (e.g. "2") incorrectly blanked the
    // dashboard for every other role (3, 4, 5...).
    if (userRole === '1') {
        return { isAuth: false, redirect: '/admin/dashboard' };
    }

    return { isAuth: true };
};

export const AuthGuard = ({ children, role }) => {
    const isApiPanel = window.location.pathname.startsWith('/api-panel');
    
    // Admin uses 'admin_token', API panel uses 'api_token' or 'access_token', member uses 'access_token'
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