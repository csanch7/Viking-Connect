import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../../../../shared/contracts'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface RecommendedMentorCardProps {
  recommendation: MentorRecommendation
}

function RecommendedMentorCard({ recommendation }: RecommendedMentorCardProps) {
  const { mentor, sharedTopicCount, matchedTopics, sameCollege } =
    recommendation
  const connectionReason = sameCollege
    ? 'You share a college connection and mentoring interests.'
    : sharedTopicCount > 0
      ? `You share ${sharedTopicCount} mentoring ${sharedTopicCount === 1 ? 'interest' : 'interests'}.`
      : 'This mentor may complement the goals in your profile.'

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-heading">
        <div>
          <h3>
            <Link to={`/mentor/${mentor.id}`}>{mentor.name}</Link>
          </h3>
          {mentor.gradYear ? (
            <p>St. Laurence class of {mentor.gradYear}</p>
          ) : (
            <p>Community member</p>
          )}
        </div>
      </div>

      <p className="recommendation-reason">{connectionReason}</p>

      <div className="recommendation-signals">
        {sharedTopicCount > 0 && (
          <span>
            {sharedTopicCount} shared{' '}
            {sharedTopicCount === 1 ? 'topic' : 'topics'}
          </span>
        )}
        {sameCollege && <span>Same college</span>}
      </div>

      <div className="recommendation-topics">
        <p>
          {matchedTopics.length > 0 ? 'Shared interests' : 'Mentor expertise'}
        </p>
        {matchedTopics.length > 0 ? (
          <ExpertiseChips
            areas={matchedTopics}
            className="directory-chips"
            countClassName="directory-chip-count"
            maxVisible={3}
          />
        ) : (
          <span className="directory-muted">No shared topics</span>
        )}
      </div>

      <Link className="recommendation-profile-link" to={`/mentor/${mentor.id}`}>
        View mentor profile
      </Link>
    </article>
  )
}

export default RecommendedMentorCard
