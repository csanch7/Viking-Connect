import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/public.css'
import './styles/directory.css'
import './styles/member.css'
import './styles/responsive.css'
import './styles/refresh.css'
import './styles/memberProfile.css'
import AppNav from './components/AppNav'
import VerificationPage from './pages/VerificationPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import PendingUsersPage from './pages/PendingUsersPage'
import DirectoryPage from './pages/MentorDirectoryPage'
import MentorPage from './pages/MentorProfilePage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PageNotFound from './pages/PageNotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import MentorListPage from './pages/MentorListPage'
import MenteeDirectoryPage from './pages/MenteeDirectoryPage'
import MenteeListPage from './pages/MenteeListPage'
import MenteePage from './pages/MenteeProfilePage'

function App() {
  const { authenticated, admin, mentee } = useAuth()
  const location = useLocation()
  const showAppNav =
    location.pathname === '/' ||
    (authenticated &&
      (location.pathname === '/directory' ||
        location.pathname === '/profile' ||
        location.pathname === '/admin' ||
        location.pathname === '/admin/pending-users' ||
        location.pathname === '/admin/mentors' ||
        location.pathname === '/admin/mentees' ||
        location.pathname === '/mentees/directory' ||
        location.pathname.startsWith('/mentor/') ||
        location.pathname.startsWith('/mentee/')))

  return (
    <>
      {showAppNav && (
        <AppNav
          isAuthenticated={authenticated}
          isAdmin={admin}
          isMentee={mentee}
        />
      )}
      <Routes>
        <Route path="*" element={<PageNotFound />} />
        <Route
          path="/"
          element={<HomePage isAuthenticated={authenticated} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentees/directory"
          element={
            <ProtectedRoute menteeRoute>
              <MenteeDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending-users"
          element={
            <ProtectedRoute adminOnly>
              <PendingUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mentors"
          element={
            <ProtectedRoute adminOnly>
              <MentorListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mentees"
          element={
            <ProtectedRoute adminOnly>
              <MenteeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/directory"
          element={
            <ProtectedRoute>
              <DirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/:id"
          element={
            <ProtectedRoute>
              <MentorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentee/:id"
          element={
            <ProtectedRoute menteeRoute>
              <MenteePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
