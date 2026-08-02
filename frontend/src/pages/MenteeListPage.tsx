import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { Mentee } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import adminService from '../services/adminService'
import MenteeListCard from '../components/user/MenteeListCard'
import ConfirmationDialog from '../components/ConfirmationDialog'

const pageSize = 10

function MenteeListPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [message, setMessage] = useState('')
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mentee | null>(null)
  const [page, setPage] = useState<number>(0)
  const [mentees, setMentees] = useState<Mentee[]>([])
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

    async function loadMentees() {
      try {
        const response = await userService.getMentees(
          page,
          [],
          debouncedSearchText,
        )

        if (!isCurrentRequest) {
          return
        }

        setMentees(response.slice(0, pageSize))
        setHasNextPage(response.length > pageSize)
        setLoadError('')
      } catch {
        if (!isCurrentRequest) {
          return
        }

        setMentees([])
        setHasNextPage(false)
        setLoadError('We could not load mentees right now. Please try again.')
      } finally {
        if (isCurrentRequest) {
          setLoading(false)
        }
      }
    }

    void loadMentees()

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
      setMentees((currentMentees) =>
        currentMentees.filter((mentee) => mentee.id !== userId),
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
          <h1 id="directory-title">Manage mentees</h1>
          <button
            className="admin-back-link"
            type="button"
            onClick={() => navigate('/admin')}
          >
            <span aria-hidden="true">←</span>
            Back to admin page
          </button>
          <p>
            Search approved mentees, review their profiles, and remove accounts
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
              <h2>Search mentees</h2>
            </div>
          </div>

          <div className="directory-search-row">
            <label className="directory-search" htmlFor="mentee-search">
              <span>Mentee name</span>
              <input
                id="mentee-search"
                type="search"
                value={searchText}
                onChange={(event) => handleSearchText(event.target.value)}
                placeholder="Search by name"
              />
            </label>
          </div>
        </form>

        {mentees.length > 0 ? (
          <section className="directory-directory" aria-label="Mentee list">
            <div className="directory-directory-header">
              <div>
                <h2>Mentees</h2>
              </div>
            </div>

            <div className="directory-list">
              {mentees.map((mentee: Mentee) => (
                <MenteeListCard
                  key={mentee.id}
                  mentee={mentee}
                  onDelete={() => {
                    setDeleteTarget(mentee)
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
            <h2>No mentees found</h2>
            <p>There are no approved mentees to show on this page yet.</p>
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
        title="Delete mentee account?"
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

export default MenteeListPage
