import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../../../../shared/contracts'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface RecommendedMentorCardProps {
  recommendation: MentorRecommendation
}

function RecommendedMentorCard({ recommendation }: RecommendedMentorCardProps) {
  const {
    mentor,
    recommendationScore,
    coveragePercentage,
    sharedTopicCount,
    matchedTopics,
    sameCollege,
  } = recommendation

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-heading">
        <div>
          <h3>
            <Link to={`/mentor/${mentor.id}`}>{mentor.name}</Link>
          </h3>
          <p>{mentor.email}</p>
        </div>
        <span
          className="recommendation-score"
          aria-label={`Recommendation score ${recommendationScore} out of 100`}
        >
          {recommendationScore}
          <small>/100</small>
        </span>
      </div>

      <div className="recommendation-signals">
        <span>{coveragePercentage}% interest coverage</span>
        <span>
          {sharedTopicCount} shared{' '}
          {sharedTopicCount === 1 ? 'topic' : 'topics'}
        </span>
        {sameCollege && <span>Same college</span>}
      </div>

      <div className="recommendation-topics">
        <p>Shared interests</p>
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
