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

function MenteePage() {
  const [mentee, setMentee] = useState<PublicUser>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { id } = useParams()

  useEffect(() => {
    async function loadMentee() {
      try {
        const response = await userService.getMentee(id ?? '')

        setMentee(response)
        setError('')
      } catch {
        setMentee(undefined)
        setError('We could not load this mentee profile.')
      } finally {
        setLoading(false)
      }
    }

    void loadMentee()
  }, [id])

  if (loading) {
    return <LoadingPage />
  }

  if (!mentee) {
    return (
      <main className="mentor-page mentor-state">
        <span className="mentor-state-icon">!</span>
        <h1>Mentee not found</h1>
        <p>{error || 'We could not load this mentee profile.'}</p>
        <Link className="mentor-primary-link" to="/directory?view=mentees">
          Back to mentee directory
        </Link>
      </main>
    )
  }

  return (
    <main className="member-profile-page">
      <Link className="member-profile-back-link" to="/directory?view=mentees">
        <span aria-hidden="true">←</span>
        Back to mentee directory
      </Link>

      <MemberProfileHero titleId="mentee-title" user={mentee} />

      <div className="member-profile-layout">
        <div className="member-profile-main-column">
          <section
            className="member-profile-card member-profile-card--accent"
            aria-labelledby="mentee-bio-title"
          >
            <MemberProfileCardHeading
              id="mentee-bio-title"
              kicker="Profile"
              title="About me"
            />
            <p className="member-profile-body">
              {mentee.bio || 'This mentee has not added a bio yet.'}
            </p>
          </section>

          <section
            className="member-profile-card"
            aria-labelledby="mentee-interests-title"
          >
            <MemberProfileCardHeading
              id="mentee-interests-title"
              kicker="Mentorship"
              title="Areas of interest"
            />

            {mentee.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentee.areasOfExpertise}
                className="member-profile-chips"
              />
            ) : (
              <p className="member-profile-muted">
                No areas of interest listed yet.
              </p>
            )}
          </section>

          <MemberProfileContact user={mentee} />
        </div>

        <MemberProfileSummary user={mentee} />
      </div>
    </main>
  )
}

export default MenteePage
