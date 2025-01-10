import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}   