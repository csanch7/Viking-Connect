import { Link } from 'react-router-dom'
import userService from '../services/userService'
import { useEffect, useState } from 'react'
import LoadingPage from '../components/LoadingPage'
import adminService from '../services/adminService'

function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mentorCount, setMentorCount] = useState<number>()
  const [menteeCount, setMenteeCount] = useState<number>()

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()

        if (response.admin) {
          setIsAdmin(true)

          const [mentorTotal, menteeTotal] = await Promise.all([
            adminService.mentorCount(),
            adminService.menteeCount(),
          ])

          setMentorCount(mentorTotal)
          setMenteeCount(menteeTotal)
          return
        }
      } catch {
        setError('We could not load the admin workspace. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    void checkSession()
  }, [])

  if (loading) {
    return <LoadingPage />
  }
  if (!isAdmin) {
    return (
      <main className="admin-page admin-state">
        <span className="admin-state-icon">!</span>
        <h1>{error ? 'Unable to load admin' : 'You are not allowed here'}</h1>
        <p>{error || 'This area is reserved for program administrators.'}</p>
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

      <section className="admin-stats" aria-labelledby="admin-stats-title">
        <div className="admin-stats-heading">
          <span className="admin-card-kicker">Directory snapshot</span>
          <h2 id="admin-stats-title">Approved members</h2>
        </div>
        <dl className="admin-stat-grid">
          <div className="admin-stat-card">
            <dt>Mentors</dt>
            <dd className="admin-stat-value">{mentorCount ?? '...'}</dd>
            <dd className="admin-stat-note">Available alumni guides</dd>
          </div>
          <div className="admin-stat-card">
            <dt>Mentees</dt>
            <dd className="admin-stat-value">{menteeCount ?? '...'}</dd>
            <dd className="admin-stat-note">Students seeking support</dd>
          </div>
        </dl>
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
