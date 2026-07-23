import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import PendingUserCard from '../components/admin/PendingUserCard'
import type { PendingUser } from '../types/pendingUser'

function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<'approve' | 'deny' | null>(null)
  const [denyConfirmationId, setDenyConfirmationId] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    async function loadUsers() {
      try {
        setUsers(await adminService.pendingUsers())
      } catch {
        setError('We could not load pending users. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    void loadUsers()
  }, [])

  async function denyUser(userId: string) {
    if (activeUserId) return

    if (denyConfirmationId !== userId) {
      setDenyConfirmationId(userId)
      return
    }

    setActiveUserId(userId)
    setActiveAction('deny')
    try {
      await adminService.denyUser(userId)
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )
      setMessage('User denied')
      setDenyConfirmationId(null)
      setError('')
    } catch {
      setError('We could not deny this user. Please try again.')
    } finally {
      setActiveUserId(null)
      setActiveAction(null)
    }
  }

  async function approveUser(userId: string) {
    if (activeUserId) return

    setActiveUserId(userId)
    setActiveAction('approve')
    try {
      await adminService.approveUser(userId)
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )
      setMessage('User approved')
      setError('')
    } catch {
      setError('We could not approve this user. Please try again.')
    } finally {
      setActiveUserId(null)
      setActiveAction(null)
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="admin-page">
      <section className="admin-hero" aria-labelledby="pending-title">
        <p className="admin-kicker">Admin workspace</p>
        <h1 id="pending-title">Pending users</h1>
        <button
          className="admin-back-link"
          type="button"
          onClick={() => navigate('/admin')}
        >
          <span aria-hidden="true">←</span>
          Back to admin page
        </button>

        <p>
          Review registration details before adding new members to the
          mentorship program.
        </p>
      </section>

      {message && (
        <div className="admin-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-message" role="alert">
          {error}
        </div>
      )}

      {users.length > 0 ? (
        <section className="pending-user-list" aria-label="Registration review queue">
          {users.map((user: PendingUser) => (
            <PendingUserCard
              key={user.id}
              user={user}
              onApprove={approveUser}
              onDeny={denyUser}
              onCancelDeny={() => setDenyConfirmationId(null)}
              confirmDeny={denyConfirmationId === user.id}
              activeAction={
                activeUserId === user.id ? activeAction ?? undefined : undefined
              }
            />
          ))}
        </section>
      ) : !error ? (
        <section className="admin-empty" aria-live="polite">
          <h2>No pending users</h2>
          <p>Everyone in the registration queue has been reviewed.</p>
        </section>
      ) : null}
    </main>
  )
}

export default PendingUsersPage
