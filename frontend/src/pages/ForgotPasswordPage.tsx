import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import passwordResetService from '../services/passwordResetService'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await passwordResetService.request(email)
      setMessage(response.message)
    } catch (caughtError) {
      setError(
        axios.isAxiosError<{ message?: string }>(caughtError)
          ? (caughtError.response?.data.message ??
              'Unable to request a reset link')
          : 'Unable to request a reset link',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="forgot-password-title">
        <div className="login-brand">
          <img className="login-brand-mark" src="/favicon.svg" alt="" />
          <span>Mentorship Program</span>
        </div>
        <div className="login-heading">
          <p className="login-kicker">Account recovery</p>
          <h1 id="forgot-password-title">Reset your password</h1>
          <p>
            Enter your account email and we will send a one-hour reset link.
          </p>
        </div>
        {message ? (
          <div className="login-success" role="status">
            {message}
          </div>
        ) : (
          <form className="login-form" onSubmit={submit}>
            {error && (
              <div className="login-alert" role="alert">
                {error}
              </div>
            )}
            <label className="login-field" htmlFor="reset-email">
              <span>Email</span>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <button
              className="login-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="login-register-prompt">
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
