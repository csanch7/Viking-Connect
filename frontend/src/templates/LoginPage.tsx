import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import loginService from '../services/loginService'
import userService from '../services/userService'
import LoadingPage from './LoadingPage'

function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()

        if (response.authenticated) {
          navigate('/profile', { replace: true })
          return
        }

        setLoading(false)
      } catch {
        // If the check fails, leave the visitor on the sign-in page.
        setLoading(false)
      }
    }

    void checkSession()
  }, [navigate])

  function handleEmail(value: string) {
    setEmail(value)
  }

  function handlePassword(value: string) {
    setPassword(value)
  }

  async function handleSignIn(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const loginUser = {
      email,
      password,
    }
    const response = await loginService.loginUser(loginUser)

    if (response.message === 'Logged in') {
      navigate('/profile')
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-brand-mark">STL</span>
          <span>Mentorship Program</span>
        </div>

        <div className="login-heading">
          <p className="login-kicker">Welcome back</p>
          <h1 id="login-title">Sign in to your account</h1>
          <p>
            Access your profile, mentorship dashboard, and program updates.
          </p>
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
              required
            />
          </label>

          <button className="login-submit-button" type="submit">
            Sign in
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
