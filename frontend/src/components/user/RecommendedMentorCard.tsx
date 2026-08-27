import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../../../../shared/contracts'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface RecommendedMentorCardProps {
  recommendation: MentorRecommendation
}

function RecommendedMentorCard({ recommendation }: RecommendedMentorCardProps) {
  const { mentor, sharedTopicCount, matchedTopics, sameCollege } =
    recommendation
  const hasSharedTopics = sharedTopicCount > 0 && matchedTopics.length > 0
  const evidenceAreas = hasSharedTopics
    ? matchedTopics
    : mentor.areasOfExpertise
  const evidenceLabel = hasSharedTopics
    ? 'Interests you share'
    : 'Mentor expertise'
  const primaryTopic = matchedTopics[0]
  const connectionReason =
    sameCollege && hasSharedTopics
      ? `A fellow St. Laurence alum who also knows ${primaryTopic}.`
      : sameCollege
        ? 'A shared college connection gives you a natural place to start.'
        : hasSharedTopics
          ? `You both share an interest in ${primaryTopic}.`
          : 'Their experience may complement your mentorship goals.'

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-heading">
        <div>
          <h3>{mentor.name}</h3>
          {mentor.gradYear ? (
            <p>St. Laurence class of {mentor.gradYear}</p>
          ) : (
            <p>Community member</p>
          )}
        </div>
        {sameCollege && (
          <span className="recommendation-college-badge">
            College connection
          </span>
        )}
      </div>

      <p className="recommendation-reason">{connectionReason}</p>

      <div className="recommendation-evidence" aria-label="Why this match">
        <p className="recommendation-evidence-label">{evidenceLabel}</p>
        {evidenceAreas.length > 0 ? (
          <ExpertiseChips
            areas={evidenceAreas}
            className="directory-chips"
            countClassName="directory-chip-count"
            maxVisible={3}
          />
        ) : (
          <span className="directory-muted">Expertise not listed yet</span>
        )}
      </div>

      <Link className="recommendation-profile-link" to={`/mentor/${mentor.id}`}>
        View profile and contact
      </Link>
    </article>
  )
}

export default RecommendedMentorCard
