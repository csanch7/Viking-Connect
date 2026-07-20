import { useEffect, useState } from 'react'
import type { PublicUser } from '../../../shared/contracts'
import userService from '../services/userService'
import { Link, useParams } from 'react-router-dom'
import LoadingPage from '../components/LoadingPage'
import ExpertiseChips from '../components/expertise/ExpertiseChips'

function MentorPage() {
  const [mentor, setMentor] = useState<PublicUser>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { id } = useParams()

  useEffect(() => {
    async function loadMentor() {
      try {
        const response = await userService.getMentor(Number(id))

        setMentor(response)
        setError('')
      } catch {
        setMentor(undefined)
        setError('We could not load this mentor profile.')
      } finally {
        setLoading(false)
      }
    }

    void loadMentor()
  }, [id])

  if (loading) {
    return <LoadingPage />
  }

  if (!mentor) {
    return (
      <main className="mentor-page mentor-state">
        <span className="mentor-state-icon">!</span>
        <h1>Mentor not found</h1>
        <p>{error || 'We could not load this mentor profile.'}</p>
        <Link className="mentor-primary-link" to="/dashboard">
          Back to directory
        </Link>
      </main>
    )
  }

  return (
    <main className="mentor-page">
      <Link className="mentor-back-link" to="/dashboard">
        <span aria-hidden="true">←</span>
        Back to mentor directory
      </Link>

      <section
        className="mentor-hero mentor-card"
        aria-labelledby="mentor-title"
      >
        <div className="mentor-cover" aria-hidden="true" />
        <div className="mentor-identity">
          <div className="mentor-avatar" aria-hidden="true">
            {mentor.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="mentor-heading">
            <p className="mentor-kicker">Alumni mentor</p>
            <h1 id="mentor-title">{mentor.name}</h1>
            <p>Mentor in the STL Mentorship Program</p>
          </div>
          <div className="mentor-actions">
            {mentor.linkedin && (
              <a
                className="mentor-secondary-link"
                href={mentor.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mentor-layout">
        <div className="mentor-main-column">
          <section className="mentor-card" aria-labelledby="mentor-bio-title">
            <div className="mentor-card-heading">
              <span>Profile</span>
              <h2 id="mentor-bio-title">About me</h2>
            </div>
            <p>{mentor.bio || 'This mentor has not added a bio yet.'}</p>
          </section>

          <section
            className="mentor-card mentor-card--accent"
            aria-labelledby="mentor-expertise-title"
          >
            <div className="mentor-card-heading">
              <span>Mentorship</span>
              <h2 id="mentor-expertise-title">Areas of expertise</h2>
            </div>

            {mentor.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentor.areasOfExpertise}
                className="mentor-chips"
              />
            ) : (
              <p className="mentor-empty">No areas of expertise listed yet.</p>
            )}
          </section>

          <section
            className="mentor-card"
            aria-labelledby="mentor-contact-title"
          >
            <div className="mentor-card-heading">
              <span>Contact</span>
              <h2 id="mentor-contact-title">About</h2>
            </div>

            <dl className="mentor-details">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${mentor.email}`}>{mentor.email}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  {mentor.linkedin ? (
                    <a href={mentor.linkedin} target="_blank" rel="noreferrer">
                      View profile <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span>Not added</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="mentor-side-column" aria-label="Mentor summary">
          <section className="mentor-card mentor-summary-card">
            <div className="mentor-card-heading">
              <span>Program</span>
              <h2>Snapshot</h2>
            </div>
            <dl className="mentor-summary-list">
              <div>
                <dt>Role</dt>
                <dd>Mentor</dd>
              </div>
              <div>
                <dt>Graduation year</dt>
                <dd>{mentor.gradYear || 'Not listed'}</dd>
              </div>
              <div>
                <dt>Member</dt>
                <dd>#{mentor.id}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default MentorPage
