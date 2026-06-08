import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Spinner />
            </div>
        )
    }

    return user ? <Outlet /> : <Navigate to="/login" />
}
