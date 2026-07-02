import { Link } from 'react-router-dom'
import userService from '../services/userService'
import { useEffect, useState } from 'react'
import LoadingPage from './LoadingPage'

function AdminPage() {
  const [status, setStatus] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()

        if (response.admin) {
          setLoading(false)
          setStatus(true)

          return
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }

    void checkSession()
  }, [])

  if (loading) {
    return <LoadingPage />
  }
  if (status === false) {
    return (
      <main className="admin-page admin-state">
        <span className="admin-state-icon">!</span>
        <h1>You are not allowed here</h1>
        <p>This area is reserved for program administrators.</p>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="admin-kicker">Admin workspace</p>
        <h1 id="admin-title">Program review center</h1>
        <p>
          Review new member registrations and keep the mentorship directory
          focused on approved participants.
        </p>
      </section>

      <section className="admin-card" aria-labelledby="pending-users-title">
        <div>
          <span className="admin-card-kicker">Pending approvals</span>
          <h2 id="pending-users-title">Review new users</h2>
          <p>
            Open the queue to approve or deny registrations waiting for admin
            review.
          </p>
        </div>
        <Link className="admin-primary-link" to="/admin/pending-users">
          View pending users
        </Link>
      </section>
    </main>
  )
}

export default AdminPage
