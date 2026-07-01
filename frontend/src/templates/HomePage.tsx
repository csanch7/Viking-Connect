import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import loginService from '../services/loginService'
import userService from '../services/userService'
import LoadingPage from './LoadingPage'

function HomePage() {
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
    <>
      <section id="center">
        <div>
          <h1>STL Mentorship Program</h1>
          <p>
            Sign in as a mentor/mentee or register{' '}
            <Link to="/register">here</Link>
          </p>
          <form onSubmit={(e) => handleSignIn(e)}>
            <input
              value={email}
              onChange={(e) => handleEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => handlePassword(e.target.value)}
              placeholder="Password"
              required
            />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </section>
    </>
  )
}

export default HomePage
