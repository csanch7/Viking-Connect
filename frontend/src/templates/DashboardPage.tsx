import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { Mentor } from '../interfaces/mentorInterface'
import { Link } from 'react-router-dom'
import LoadingPage from './LoadingPage'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(0)
  const [mentors, setMentors] = useState<Mentor[]>([])
  useEffect(() => {
    async function getUsers() {
      const response = await userService.getMentors(page)
      console.log(response)

      if (response.message !== 'Forbidden') {
        setLoading(false)
        setMentors(response)
      }
    }

    void getUsers()
  }, [page])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <p className="dashboard-kicker">Mentor directory</p>
        <h1 id="dashboard-title">Find alumni mentors</h1>
        <p>
          Browse approved mentors and open a profile to learn more about their
          experience, contact details, and areas of expertise.
        </p>
      </section>

      {mentors.length > 0 ? (
        <section className="dashboard-grid" aria-label="Mentor list">
          {mentors.map((mentor: Mentor) => (
            <article className="dashboard-card" key={mentor.id}>
              <div className="dashboard-card-header">
                <div className="dashboard-avatar" aria-hidden="true">
                  {mentor.username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2>
                    <Link to={`/user/${mentor.id}`}>{mentor.username}</Link>
                  </h2>
                  <p>{mentor.email}</p>
                </div>
              </div>

              <dl className="dashboard-details">
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
                      <span>Not added</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Expertise</dt>
                  <dd>
                    {mentor.aoeList.length > 0
                      ? mentor.aoeList.join(', ')
                      : 'No areas listed yet'}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      ) : (
        <section className="dashboard-empty" aria-live="polite">
          <h2>No mentors found</h2>
          <p>There are no mentors to show on this page yet.</p>
        </section>
      )}
      <div className="dashboard-pagination">
        <p>Page {page+1}</p>
        <div className="dashboard-pagination-actions">
          {page > 0 && (
            <button onClick={() => {
              setPage((prevPage) => prevPage - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>Previous page</button>
          )}
          {mentors.length === 10 && <button onClick={() => {
              setPage((nextPage) => nextPage + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
          }}>Next page</button>}
        </div>
      </div>
    </main>
  )
}

export default DashboardPage
