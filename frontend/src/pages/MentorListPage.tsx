import userService from '../services/userService'
import type { Mentor } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import { useNavigate } from 'react-router-dom'
import MentorListCard from '../components/user/MentorListCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useAdminUserList } from '../hooks/useAdminUserList'

function loadMentors(page: number, searchText: string) {
  return userService.getMentors(page, [], searchText)
}

function MentorListPage() {
  const navigate = useNavigate()
  const list = useAdminUserList<Mentor>({
    queryName: 'mentors',
    loadUsers: loadMentors,
    loadErrorMessage: 'We could not load mentors right now. Please try again.',
  })
  const {
    page,
    searchText,
    users: mentors,
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
                onChange={(event) => list.changeSearch(event.target.value)}
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
                  onDelete={() => list.beginDelete(mentor)}
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
        title="Delete mentor account?"
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
            deleted.
          </p>
        )}
      </ConfirmationDialog>
    </main>
  )
}

export default MentorListPage
