import type { Mentee } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import UserDirectoryCard from '../components/user/UserDirectoryCard'
import { useMenteeDirectory } from '../hooks/useMenteeDirectory'

function MenteeDirectoryPage() {
  const directory = useMenteeDirectory()
  const {
    page,
    searchText,
    expertiseSearchText,
    draftExpertise,
    filterPanelOpen,
    mentees,
    hasNextPage,
    error,
    topicsLoading,
    topicsError,
    visibleExpertiseOptions,
    activeFilterCount,
    canClearFilters,
    colleges,
    collegesError,
    collegesLoading,
    draftCollege,
  } = directory

  function handleFilter(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    directory.applyFilters()
  }

  if (directory.loading) {
    return <LoadingPage />
  }

  return (
    <main className="directory-page">
      <div className="directory-shell">
        <section className="directory-hero" aria-labelledby="directory-title">
          <p className="directory-kicker">Directory</p>
          <h1 id="directory-title">Connect with fellow mentees</h1>
          <p>
            Browse approved mentees and open a profile to learn about their
            interests, graduation year, and contact details.
          </p>
        </section>

        <form className="directory-controls" onSubmit={handleFilter}>
          <div className="directory-filters-header">
            <div>
              <h2>Search mentees</h2>
              <p>Find students by name, area of interest, or both.</p>
            </div>
          </div>

          <div className="directory-search-row">
            <label className="directory-search" htmlFor="mentee-search">
              <span>Mentee name</span>
              <input
                id="mentee-search"
                type="search"
                value={searchText}
                onChange={(event) => directory.changeSearch(event.target.value)}
                placeholder="Search by name"
              />
            </label>

            <button
              className="directory-filter-toggle"
              type="button"
              aria-expanded={filterPanelOpen}
              aria-controls="directory-filter-panel"
              onClick={directory.toggleFilterPanel}
            >
              Filters
              <span>{activeFilterCount}</span>
            </button>
          </div>

          {filterPanelOpen && (
            <div className="directory-filter-panel" id="directory-filter-panel">
              <div className="directory-filter-fields">
                <label
                  className="directory-filter-search"
                  htmlFor="interest-search"
                >
                  <span>Search interests</span>
                  <input
                    id="interest-search"
                    type="search"
                    value={expertiseSearchText}
                    onChange={(event) =>
                      directory.changeExpertiseSearch(event.target.value)
                    }
                    placeholder="Find a filter"
                  />
                </label>

                <label
                  className="directory-filter-select"
                  htmlFor="college-filter"
                >
                  <span>College</span>
                  <div className="directory-filter-select-shell">
                    <select
                      id="college-filter"
                      value={draftCollege}
                      onChange={(event) =>
                        directory.changeCollege(event.target.value)
                      }
                      disabled={collegesLoading || Boolean(collegesError)}
                    >
                      <option value="">
                        {collegesLoading
                          ? 'Loading colleges...'
                          : 'Any college'}
                      </option>
                      {colleges.map((college) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="directory-filter-select-icon"
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path d="m6 8 4 4 4-4" />
                    </svg>
                  </div>
                </label>
              </div>

              {collegesError && (
                <p className="directory-filter-empty" role="alert">
                  {collegesError}
                </p>
              )}

              <fieldset className="directory-filter-options">
                <legend className="sr-only">Areas of interest</legend>
                {topicsLoading ? (
                  <p className="directory-filter-empty" aria-live="polite">
                    Loading expertise filters...
                  </p>
                ) : topicsError ? (
                  <p className="directory-filter-empty" role="alert">
                    {topicsError}
                  </p>
                ) : visibleExpertiseOptions.length > 0 ? (
                  visibleExpertiseOptions.map((area) => (
                    <label className="directory-filter-chip" key={area}>
                      <input
                        type="checkbox"
                        name="expertise"
                        value={area}
                        checked={draftExpertise.includes(area)}
                        onChange={(event) =>
                          directory.toggleExpertise(area, event.target.checked)
                        }
                      />
                      <span>{area}</span>
                    </label>
                  ))
                ) : (
                  <p className="directory-filter-empty">
                    No interest filters match.
                  </p>
                )}
              </fieldset>

              <div className="directory-filter-actions">
                <button className="directory-filter-submit" type="submit">
                  Apply filters
                </button>
                <button
                  className="directory-filter-clear"
                  type="reset"
                  onClick={directory.clearFilters}
                  disabled={!canClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
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
                <UserDirectoryCard key={mentee.id} user={mentee} />
              ))}
            </div>
          </section>
        ) : error ? (
          <section className="directory-empty" aria-live="polite">
            <h2>Unable to load mentees</h2>
            <p>{error}</p>
          </section>
        ) : (
          <section className="directory-empty" aria-live="polite">
            <h2>No mentees found</h2>
            <p>There are no other approved mentees to show yet.</p>
          </section>
        )}
        <div className="directory-pagination">
          <p>Page {page + 1}</p>
          <div className="directory-pagination-actions">
            {page > 0 && (
              <button onClick={() => directory.changePage(page - 1)}>
                Previous page
              </button>
            )}
            {hasNextPage && (
              <button onClick={() => directory.changePage(page + 1)}>
                Next page
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default MenteeDirectoryPage
