import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { Mentor } from '../interfaces/mentorInterface'
import { Link } from 'react-router-dom'
import LoadingPage from './LoadingPage'
import { areasOfExpertise } from '../interfaces/areasOfExpertise'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(0)
  const [filter, setFilter] = useState<string[]>([])
  const [draftFilter, setDraftFilter] = useState<string[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [filterSearchText, setFilterSearchText] = useState<string>('')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const visibleExpertiseOptions = areasOfExpertise.filter((area) =>
    area.toLowerCase().includes(filterSearchText.trim().toLowerCase()),
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchText(searchText.trim())
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [searchText])

  useEffect(() => {
    let isCurrentRequest = true

    async function getUsers() {
      const response = await userService.getMentors(
        page,
        filter,
        debouncedSearchText,
      )

      if (!isCurrentRequest) {
        return
      }

      if (response.message !== 'Forbidden') {
        setLoading(false)
        setMentors(response)
      }
    }

    void getUsers()

    return () => {
      isCurrentRequest = false
    }
  }, [page, filter, debouncedSearchText])

  function handleFilter(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    setFilter(draftFilter)
    setPage(0)
  }

  function handleExpertiseChange(area: string, checked: boolean) {
    setDraftFilter((previousFilter) =>
      checked
        ? [...previousFilter, area]
        : previousFilter.filter((selectedArea) => selectedArea !== area),
    )
  }

  function handleSearchText(value: string) {
    setSearchText(value)
    setPage(0)
  }

  function clearFilter() {
    setFilter([])
    setDraftFilter([])
    setFilterSearchText('')
    setPage(0)
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <section className="dashboard-hero" aria-labelledby="dashboard-title">
          <p className="dashboard-kicker">Directory</p>
          <h1 id="dashboard-title">Find alumni mentors</h1>
          <p>
            Browse mentors and open a profile to learn more about their
            experience, contact details, and areas of expertise.
          </p>
        </section>

        <form className="dashboard-controls" onSubmit={handleFilter}>
          <div className="dashboard-filters-header">
            <div>
              <h2>Search mentors</h2>
              <p>Find alumni by name, expertise, or both.</p>
            </div>
          </div>

          <div className="dashboard-search-row">
            <label className="dashboard-search" htmlFor="mentor-search">
              <span>Mentor name</span>
              <input
                id="mentor-search"
                type="search"
                value={searchText}
                onChange={(event) => handleSearchText(event.target.value)}
                placeholder="Search by name"
              />
            </label>

            <button
              className="dashboard-filter-toggle"
              type="button"
              aria-expanded={filterPanelOpen}
              aria-controls="dashboard-filter-panel"
              onClick={() =>
                setFilterPanelOpen((currentIsOpen) => !currentIsOpen)
              }
            >
              Filters
              <span>{draftFilter.length}</span>
            </button>
          </div>

          {filterPanelOpen && (
            <div className="dashboard-filter-panel" id="dashboard-filter-panel">
              <label
                className="dashboard-filter-search"
                htmlFor="expertise-search"
              >
                <span>Search expertise</span>
                <input
                  id="expertise-search"
                  type="search"
                  value={filterSearchText}
                  onChange={(event) => setFilterSearchText(event.target.value)}
                  placeholder="Find a filter"
                />
              </label>

              <fieldset className="dashboard-filter-options">
                <legend className="sr-only">Areas of expertise</legend>
                {visibleExpertiseOptions.length > 0 ? (
                  visibleExpertiseOptions.map((area, index) => (
                    <label
                      className="dashboard-filter-chip"
                      key={`${area}-${index}`}
                    >
                      <input
                        type="checkbox"
                        name="expertise"
                        value={area}
                        checked={draftFilter.includes(area)}
                        onChange={(event) =>
                          handleExpertiseChange(area, event.target.checked)
                        }
                      />
                      <span>{area}</span>
                    </label>
                  ))
                ) : (
                  <p className="dashboard-filter-empty">
                    No expertise filters match.
                  </p>
                )}
              </fieldset>

              <div className="dashboard-filter-actions">
                <button className="dashboard-filter-submit" type="submit">
                  Apply filters
                </button>
                <button
                  className="dashboard-filter-clear"
                  type="reset"
                  onClick={() => {
                    clearFilter()
                    setSearchText('')
                  }}
                  disabled={
                    draftFilter.length === 0 &&
                    filter.length === 0 &&
                    searchText.length === 0 &&
                    filterSearchText.length === 0
                  }
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </form>

        {mentors.length > 0 ? (
          <section className="dashboard-directory" aria-label="Mentor list">
            <div className="dashboard-directory-header">
              <div>
                <h2>Mentors</h2>
              </div>
            </div>

            <div className="dashboard-list">
              {mentors.map((mentor: Mentor) => (
                <article className="dashboard-card" key={mentor.id}>
                  <div className="dashboard-card-header">
                    <div className="dashboard-avatar" aria-hidden="true">
                      {mentor.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="dashboard-card-heading">
                      <h3>
                        <Link to={`/user/${mentor.id}`}>{mentor.username}</Link>
                      </h3>
                      <p>{mentor.email}</p>
                    </div>
                  </div>

                  <dl className="dashboard-details">
                    <div>
                      <dt>Expertise</dt>
                      <dd>
                        {mentor.aoeList.length > 0 ? (
                          <ul className="dashboard-chips">
                            {mentor.aoeList.map((area) => (
                              <li key={area}>{area}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="dashboard-muted">
                            No areas listed yet
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>LinkedIn</dt>
                      <dd>
                        {mentor.linkedin ? (
                          <a
                            href={mentor.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View profile <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <span className="dashboard-muted">Not added</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="dashboard-empty" aria-live="polite">
            <h2>No mentors found</h2>
            <p>There are no mentors to show on this page yet.</p>
          </section>
        )}
        <div className="dashboard-pagination">
          <p>Page {page + 1}</p>
          <div className="dashboard-pagination-actions">
            {page > 0 && (
              <button
                onClick={() => {
                  setPage((prevPage) => prevPage - 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Previous page
              </button>
            )}
            {mentors.length === 10 && (
              <button
                onClick={() => {
                  setPage((prevPage) => prevPage + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Next page
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardPage
