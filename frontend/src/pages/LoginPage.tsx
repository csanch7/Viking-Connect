import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import loginService from '../services/loginService'
import LoadingPage from '../components/LoadingPage'
import axios from 'axios'
import { useAuth } from '../auth/useAuth'

interface ApiErrorResponse {
  message?: string
}

function LoginPage() {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { authenticated, isCheckingSession, refreshSession } = useAuth()

  function handleEmail(value: string) {
    setEmail(value)
    setError('')
  }

  function handlePassword(value: string) {
    setPassword(value)
    setError('')
  }

  function handleError(value: string) {
    setError(value)
  }

  async function handleSignIn(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      const credentials = {
        email,
        password,
      }

      const response = await loginService.login(credentials)

      if (response.message === 'Logged in') {
        await refreshSession()
        const destination =
          (location.state as { from?: { pathname?: string } } | null)?.from
            ?.pathname ?? '/profile'
        navigate(destination, { replace: true })
      } else {
        setError('Unable to sign in. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      setIsSubmitting(false)
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleError(
          error.response?.data.message ??
            'Unable to sign in. Please try again.',
        )
        return
      }
      handleError('Unable to sign in. Please try again.')
    }
  }

  if (isCheckingSession) {
    return <LoadingPage />
  }

  if (authenticated) {
    return <Navigate to="/profile" replace />
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-brand-mark">STL</span>
          <span>Mentorship Program</span>
        </div>

        {error && (
          <div className="login-alert" id="login-error" role="alert">
            <span className="login-alert-icon" aria-hidden="true">
              !
            </span>
            <p>{error}</p>
          </div>
        )}

        <div className="login-heading">
          <p className="login-kicker">Welcome back</p>
          <h1 id="login-title">Sign in to your account</h1>
          <p>Access your profile, mentorship dashboard, and program updates.</p>
        </div>

        <form className="login-form" onSubmit={(e) => handleSignIn(e)}>
          <label className="login-field" htmlFor="login-email">
            <span>Email</span>
            <input
              id="login-email"
              value={email}
              type="email"
              onChange={(e) => handleEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              required
            />
          </label>

          <label className="login-field" htmlFor="login-password">
            <span>Password</span>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => handlePassword(e.target.value)}
              placeholder="Enter your password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              required
            />
          </label>

          <button
            className="login-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login-register-prompt">
          New to the program? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
