import { Link } from 'react-router-dom'
import type { MentorRecommendation } from '../../../../shared/contracts'
import ExpertiseChips from '../expertise/ExpertiseChips'
import type { MatchActionType } from '../../../../shared/contracts'
import { getMentorRecommendationReason } from '../../utils/recommendationCopy'

interface RecommendedMentorCardProps {
  recommendation: MentorRecommendation
  pending: boolean
  onAction: (
    memberId: string,
    memberName: string,
    action: MatchActionType,
  ) => void
}

function RecommendedMentorCard({
  recommendation,
  pending,
  onAction,
}: RecommendedMentorCardProps) {
  const { mentor, sharedTopicCount, matchedTopics, sameCollege } =
    recommendation
  const hasSharedTopics = sharedTopicCount > 0 && matchedTopics.length > 0
  const evidenceAreas = hasSharedTopics
    ? matchedTopics
    : mentor.areasOfExpertise
  const evidenceLabel = hasSharedTopics
    ? 'Expertise matching your interests'
    : 'Mentor expertise / industries'
  const connectionReason = getMentorRecommendationReason(
    matchedTopics,
    sameCollege,
  )

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
            areaLabel={
              hasSharedTopics
                ? 'areas of interest'
                : 'areas of expertise / industries'
            }
          />
        ) : (
          <span className="directory-muted">
            Expertise / industries not listed yet
          </span>
        )}
      </div>

      <div className="recommendation-card-actions">
        <Link
          className="recommendation-profile-link"
          to={`/mentor/${mentor.id}`}
        >
          View profile and contact
        </Link>
        <div>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction(mentor.id, mentor.name, 'contacted')}
          >
            {pending ? 'Saving...' : 'Mark as contacted'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction(mentor.id, mentor.name, 'dismissed')}
          >
            Not a fit
          </button>
        </div>
      </div>
    </article>
  )
}

export default RecommendedMentorCard
