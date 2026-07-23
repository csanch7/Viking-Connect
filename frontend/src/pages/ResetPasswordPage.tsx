import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import passwordResetService from '../services/passwordResetService'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      setError('Make sure passwords match')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await passwordResetService.reset(token, password)
      setMessage(response.message)
    } catch (caughtError) {
      setError(
        axios.isAxiosError<{ message?: string }>(caughtError)
          ? (caughtError.response?.data.message ??
              'Unable to reset your password')
          : 'Unable to reset your password',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="reset-password-title">
        <div className="login-brand">
          <img className="login-brand-mark" src="/favicon.svg" alt="" />
          <span>Mentorship Program</span>
        </div>
        <div className="login-heading">
          <p className="login-kicker">Account recovery</p>
          <h1 id="reset-password-title">Choose a new password</h1>
          <p>
            Use at least 12 characters with uppercase, lowercase, a number, and
            a special character.
          </p>
        </div>
        {!token ? (
          <div className="login-alert" role="alert">
            This reset link is invalid.
          </div>
        ) : message ? (
          <div className="login-success" role="status">
            {message}. You can now sign in.
          </div>
        ) : (
          <form className="login-form" onSubmit={submit}>
            {error && (
              <div className="login-alert" role="alert">
                {error}
              </div>
            )}
            <label className="login-field" htmlFor="new-password">
              <span>New password</span>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={12}
                required
              />
            </label>
            <label className="login-field" htmlFor="confirm-new-password">
              <span>Confirm new password</span>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                minLength={12}
                required
              />
            </label>
            <button
              className="login-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save new password'}
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

export default ResetPasswordPage
