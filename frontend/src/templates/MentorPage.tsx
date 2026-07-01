import { useEffect, useState } from 'react'
import type { Mentor } from '../interfaces/mentorInterface'
import userService from '../services/userService'
import { Link, useParams } from 'react-router-dom'
import LoadingPage from './LoadingPage'

function MentorPage() {
  const [mentor, setMentor] = useState<Mentor>()
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    async function getUsers() {
      const response = await userService.getUser(Number(id))
      console.log(response)

      if (response.message !== 'Forbidden') {
        setMentor(response)
      }
      setLoading(false)
    }

    void getUsers()
  }, [id])

  if (loading) {
    return <LoadingPage />
  }

  if (!mentor) {
    return (
      <main className="mentor-page mentor-state">
        <span className="mentor-state-icon">!</span>
        <h1>Mentor not found</h1>
        <p>We could not load this mentor profile.</p>
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

      <section className="mentor-hero" aria-labelledby="mentor-title">
        <div className="mentor-avatar" aria-hidden="true">
          {mentor.username.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="mentor-kicker">Alumni mentor</p>
          <h1 id="mentor-title">{mentor.username}</h1>
          <p>
            Review this mentor&apos;s contact details and areas of expertise
            before reaching out.
          </p>
        </div>
      </section>

      <div className="mentor-grid">
        <section className="mentor-card" aria-labelledby="mentor-contact-title">
          <div className="mentor-card-heading">
            <span>Contact</span>
            <h2 id="mentor-contact-title">Profile details</h2>
          </div>

          <dl className="mentor-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${mentor.email}`}>{mentor.email}</a>
              </dd>
            </div>
            <div>
              <dt>Graduation year</dt>
              <dd>{mentor.gradYear || 'Not listed'}</dd>
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

        <section
          className="mentor-card mentor-card--accent"
          aria-labelledby="mentor-expertise-title"
        >
          <div className="mentor-card-heading">
            <span>Mentorship</span>
            <h2 id="mentor-expertise-title">Areas of expertise</h2>
          </div>

          {mentor.aoeList.length > 0 ? (
            <ul className="mentor-chips">
              {mentor.aoeList.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="mentor-empty">No areas of expertise listed yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default MentorPage
