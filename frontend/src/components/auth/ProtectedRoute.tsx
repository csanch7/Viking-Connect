import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import LoadingPage from '../LoadingPage'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
  menteeRoute?: boolean
}

function ProtectedRoute({
  children,
  adminOnly = false,
  menteeRoute = false,
}: ProtectedRouteProps) {
  const { authenticated, admin, mentee, isCheckingSession } = useAuth()
  const location = useLocation()

  if (isCheckingSession) {
    return <LoadingPage />
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (adminOnly && !admin) {
    return <Navigate to="/directory" replace />
  }

  if (menteeRoute && !admin && !mentee) {
    return <Navigate to="/directory" replace />
  }

  return children
}

export default ProtectedRoute
