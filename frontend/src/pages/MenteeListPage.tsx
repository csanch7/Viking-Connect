import userService from '../services/userService'
import type { Mentee } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import MenteeListCard from '../components/user/MenteeListCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useAdminUserList } from '../hooks/useAdminUserList'

function loadMentees(page: number, searchText: string) {
  return userService.getMentees(page, [], searchText)
}

function MenteeListPage() {
  const navigate = useNavigate()
  const list = useAdminUserList<Mentee>({
    queryName: 'mentees',
    loadUsers: loadMentees,
    loadErrorMessage: 'We could not load mentees right now. Please try again.',
  })
  const {
    page,
    searchText,
    users: mentees,
    hasNextPage,
    loadError,
    deleteError,
    message,
    activeUserId,
    deleteTarget,
  } = list

  function handleFilter(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  if (list.loading) {
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
                onChange={(event) => list.changeSearch(event.target.value)}
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
                  onDelete={() => list.beginDelete(mentee)}
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
              <button onClick={() => list.changePage(page - 1)}>
                Previous page
              </button>
            )}
            {hasNextPage && (
              <button onClick={() => list.changePage(page + 1)}>
                Next page
              </button>
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
        onCancel={list.cancelDelete}
        onConfirm={list.confirmDelete}
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
