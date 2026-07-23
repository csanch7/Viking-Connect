import { useEffect, useState } from 'react'
import type { PublicUser } from '../../../shared/contracts'
import userService from '../services/userService'
import { Link, useParams } from 'react-router-dom'
import LoadingPage from '../components/LoadingPage'
import ExpertiseChips from '../components/expertise/ExpertiseChips'
import MemberProfileCardHeading from '../components/profile/MemberProfileCardHeading'
import MemberProfileContact from '../components/profile/MemberProfileContact'
import MemberProfileHero from '../components/profile/MemberProfileHero'
import MemberProfileSummary from '../components/profile/MemberProfileSummary'

function MentorPage() {
  const [mentor, setMentor] = useState<PublicUser>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { id } = useParams()

  useEffect(() => {
    async function loadMentor() {
      try {
        const response = await userService.getMentor(id ?? '')

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
    <main className="member-profile-page">
      <Link className="member-profile-back-link" to="/dashboard">
        <span aria-hidden="true">←</span>
        Back to mentor directory
      </Link>

      <MemberProfileHero
        titleId="mentor-title"
        user={mentor}
      />

      <div className="member-profile-layout">
        <div className="member-profile-main-column">
          <section
            className="member-profile-card member-profile-card--accent"
            aria-labelledby="mentor-bio-title"
          >
            <MemberProfileCardHeading
              id="mentor-bio-title"
              kicker="Profile"
              title="About me"
            />
            <p className="member-profile-body">
              {mentor.bio || 'This mentor has not added a bio yet.'}
            </p>
          </section>

          <section
            className="member-profile-card"
            aria-labelledby="mentor-expertise-title"
          >
            <MemberProfileCardHeading
              id="mentor-expertise-title"
              kicker="Mentorship"
              title="Areas of expertise"
            />

            {mentor.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentor.areasOfExpertise}
                className="member-profile-chips"
              />
            ) : (
              <p className="member-profile-muted">
                No areas of expertise listed yet.
              </p>
            )}
          </section>

          <MemberProfileContact user={mentor} />
        </div>

        <MemberProfileSummary user={mentor} />
      </div>
    </main>
  )
}

export default MentorPage
