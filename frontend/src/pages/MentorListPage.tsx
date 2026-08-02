import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { Mentor } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import adminService from '../services/adminService'
import MentorListCard from '../components/user/MentorListCard'
import ConfirmationDialog from '../components/ConfirmationDialog'

const pageSize = 10

function MentorListPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [message, setMessage] = useState('')
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mentor | null>(null)
  const [page, setPage] = useState<number>(0)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [searchText, setSearchText] = useState<string>('')

  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim())
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [searchText])

  useEffect(() => {
    let isCurrentRequest = true

    async function loadMentors() {
      try {
        const response = await userService.getMentors(
          page,
          [],
          debouncedSearchText,
        )

        if (!isCurrentRequest) {
          return
        }

        setMentors(response.slice(0, pageSize))
        setHasNextPage(response.length > pageSize)
        setLoadError('')
      } catch {
        if (!isCurrentRequest) {
          return
        }

        setMentors([])
        setHasNextPage(false)
        setLoadError('We could not load mentors right now. Please try again.')
      } finally {
        if (isCurrentRequest) {
          setLoading(false)
        }
      }
    }

    void loadMentors()

    return () => {
      isCurrentRequest = false
    }
  }, [page, debouncedSearchText])

  function handleFilter(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    setPage(0)
  }

  function handleSearchText(value: string) {
    setSearchText(value)
    setPage(0)
  }

  function changePage(nextPage: number) {
    setPage(nextPage)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  async function handleDeleteUser(userId: string) {
    if (activeUserId) return

    setActiveUserId(userId)
    setDeleteError('')
    try {
      const response = await adminService.deleteUser(userId)
      setMentors((currentMentors) =>
        currentMentors.filter((mentor) => mentor.id !== userId),
      )
      setMessage(response.message)
      setDeleteTarget(null)
    } catch {
      setDeleteError('We could not delete this user. Please try again.')
    } finally {
      setActiveUserId(null)
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="directory-page">
      <div className="directory-shell">
        <section className="directory-hero" aria-labelledby="directory-title">
          <p className="directory-kicker">Admin workspace</p>
          <h1 id="directory-title">Manage mentors</h1>
          <button
            className="admin-back-link"
            type="button"
            onClick={() => navigate('/admin')}
          >
            <span aria-hidden="true">←</span>
            Back to admin page
          </button>
          <p>
            Search approved mentors, review their profiles, and remove accounts
            that should no longer have access to the program.
          </p>
        </section>
        {message && (
          <div className="admin-message" role="status">
            {message}
          </div>
        )}
        {loadError && (
          <div className="admin-message directory-error-message" role="alert">
            {loadError}
          </div>
        )}

        <form className="directory-controls" onSubmit={handleFilter}>
          <div className="directory-filters-header">
            <div>
              <h2>Search mentors</h2>
            </div>
          </div>

          <div className="directory-search-row">
            <label className="directory-search" htmlFor="mentor-search">
              <span>Mentor name</span>
              <input
                id="mentor-search"
                type="search"
                value={searchText}
                onChange={(event) => handleSearchText(event.target.value)}
                placeholder="Search by name"
              />
            </label>
          </div>
        </form>

        {mentors.length > 0 ? (
          <section className="directory-directory" aria-label="Mentor list">
            <div className="directory-directory-header">
              <div>
                <h2>Mentors</h2>
              </div>
            </div>

            <div className="directory-list">
              {mentors.map((mentor: Mentor) => (
                <MentorListCard
                  key={mentor.id}
                  mentor={mentor}
                  onDelete={() => {
                    setDeleteTarget(mentor)
                    setDeleteError('')
                    setMessage('')
                  }}
                  actionsDisabled={Boolean(activeUserId)}
                />
              ))}
            </div>
          </section>
        ) : loadError ? null : (
          <section className="directory-empty" aria-live="polite">
            <h2>No mentors found</h2>
            <p>There are no mentors to show on this page yet.</p>
          </section>
        )}
        <div className="directory-pagination">
          <p>Page {page + 1}</p>
          <div className="directory-pagination-actions">
            {page > 0 && (
              <button onClick={() => changePage(page - 1)}>
                Previous page
              </button>
            )}
            {hasNextPage && (
              <button onClick={() => changePage(page + 1)}>Next page</button>
            )}
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete mentor account?"
        confirmLabel="Delete account"
        pendingLabel="Deleting account..."
        pending={Boolean(activeUserId)}
        error={deleteError}
        onCancel={() => {
          if (!activeUserId) {
            setDeleteTarget(null)
            setDeleteError('')
          }
        }}
        onConfirm={() => {
          if (deleteTarget) void handleDeleteUser(deleteTarget.id)
        }}
      >
        {deleteTarget && (
          <p>
            <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) will be
            permanently deleted. This action cannot be undone.
          </p>
        )}
      </ConfirmationDialog>
    </main>
  )
}

export default MentorListPage
