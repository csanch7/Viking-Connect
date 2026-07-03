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
  const [mentors, setMentors] = useState<Mentor[]>([])

  useEffect(() => {
    async function getUsers() {
      const response = await userService.getMentors(page, filter)

      if (response.message !== 'Forbidden') {
        setLoading(false)
        setMentors(response)
      }
    }
    void getUsers()
  }, [page, filter])

  async function handleFilter(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const selectedAreas = formData.getAll('expertise').map(String)

    setFilter(selectedAreas)
    setPage(0)
  }

  function clearFilter() {
    setFilter([])
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

        <form className="dashboard-filters" onSubmit={handleFilter}>
          <div className="dashboard-filters-header">
            <div>
              <h2>Filter by expertise</h2>
              <p>Choose one or more focus areas to narrow the mentor list.</p>
            </div>
            
          </div>

          <fieldset className="dashboard-filter-options">
            <legend className="sr-only">Areas of expertise</legend>
            {areasOfExpertise.map((area) => (
              <label className="dashboard-filter-chip" key={area}>
                <input type="checkbox" name="expertise" value={area} />
                <span>{area}</span>
              </label>
            ))}
          </fieldset>

          <div className="dashboard-filter-actions">
            <button className="dashboard-filter-submit" type="submit">
              Apply filters
            </button>
            <button
              className="dashboard-filter-clear"
              type="reset"
              onClick={clearFilter}
              disabled={filter.length === 0}
            >
              Clear
            </button>
          </div>
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
