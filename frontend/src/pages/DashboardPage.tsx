import { useEffect, useState } from 'react'
import userService from '../services/userService'
import topicService from '../services/topicService'
import type { Mentor } from '../types/mentor'
import LoadingPage from '../components/LoadingPage'
import MentorDirectoryCard from '../components/mentor/MentorDirectoryCard'

const pageSize = 10

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [topicsError, setTopicsError] = useState('')
  const [page, setPage] = useState<number>(0)
  const [filter, setFilter] = useState<string[]>([])
  const [draftFilter, setDraftFilter] = useState<string[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [filterSearchText, setFilterSearchText] = useState<string>('')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const visibleExpertiseOptions = topics.filter((area) =>
    area.toLowerCase().includes(filterSearchText.trim().toLowerCase()),
  )

  useEffect(() => {
    let isCurrentRequest = true

    async function loadTopics() {
      try {
        const response = await topicService.getTopics()

        if (isCurrentRequest) {
          setTopics(response)
          setTopicsError('')
        }
      } catch {
        if (isCurrentRequest) {
          setTopics([])
          setTopicsError(
            'We could not load expertise filters. Please refresh and try again.',
          )
        }
      } finally {
        if (isCurrentRequest) {
          setTopicsLoading(false)
        }
      }
    }

    void loadTopics()

    return () => {
      isCurrentRequest = false
    }
  }, [])

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
          filter,
          debouncedSearchText,
        )

        if (!isCurrentRequest) {
          return
        }

        setMentors(response.slice(0, pageSize))
        setHasNextPage(response.length > pageSize)
        setError('')
      } catch {
        if (!isCurrentRequest) {
          return
        }

        setMentors([])
        setHasNextPage(false)
        setError('We could not load mentors right now. Please try again.')
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
                {topicsLoading ? (
                  <p className="dashboard-filter-empty" aria-live="polite">
                    Loading expertise filters...
                  </p>
                ) : topicsError ? (
                  <p className="dashboard-filter-empty" role="alert">
                    {topicsError}
                  </p>
                ) : visibleExpertiseOptions.length > 0 ? (
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
                <MentorDirectoryCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </section>
        ) : error ? (
          <section className="dashboard-empty" aria-live="polite">
            <h2>Unable to load mentors</h2>
            <p>{error}</p>
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
            {hasNextPage && (
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
