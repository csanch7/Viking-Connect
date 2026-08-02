import { useEffect, useState } from 'react'
import userService from '../services/userService'
import topicService from '../services/topicService'
import type { Mentor } from '../types/user'
import LoadingPage from '../components/LoadingPage'
import UserDirectoryCard from '../components/user/UserDirectoryCard'

const pageSize = 10

function DirectoryPage() {
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

  function changePage(nextPage: number) {
    setPage(nextPage)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="directory-page">
      <div className="directory-shell">
        <section className="directory-hero" aria-labelledby="directory-title">
          <p className="directory-kicker">Directory</p>
          <h1 id="directory-title">Find alumni mentors</h1>
          <p>
            Browse mentors and open a profile to learn more about their
            experience, contact details, and areas of expertise.
          </p>
        </section>

        <form className="directory-controls" onSubmit={handleFilter}>
          <div className="directory-filters-header">
            <div>
              <h2>Search mentors</h2>
              <p>Find alumni by name, expertise, or both.</p>
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

            <button
              className="directory-filter-toggle"
              type="button"
              aria-expanded={filterPanelOpen}
              aria-controls="directory-filter-panel"
              onClick={() =>
                setFilterPanelOpen((currentIsOpen) => !currentIsOpen)
              }
            >
              Filters
              <span>{draftFilter.length}</span>
            </button>
          </div>

          {filterPanelOpen && (
            <div className="directory-filter-panel" id="directory-filter-panel">
              <label
                className="directory-filter-search"
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

              <fieldset className="directory-filter-options">
                <legend className="sr-only">Areas of expertise</legend>
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
                        checked={draftFilter.includes(area)}
                        onChange={(event) =>
                          handleExpertiseChange(area, event.target.checked)
                        }
                      />
                      <span>{area}</span>
                    </label>
                  ))
                ) : (
                  <p className="directory-filter-empty">
                    No expertise filters match.
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
          <section className="directory-directory" aria-label="Mentor list">
            <div className="directory-directory-header">
              <div>
                <h2>Mentors</h2>
              </div>
            </div>

            <div className="directory-list">
              {mentors.map((mentor: Mentor) => (
                <UserDirectoryCard key={mentor.id} user={mentor} />
              ))}
            </div>
          </section>
        ) : error ? (
          <section className="directory-empty" aria-live="polite">
            <h2>Unable to load mentors</h2>
            <p>{error}</p>
          </section>
        ) : (
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
    </main>
  )
}

export default DirectoryPage
