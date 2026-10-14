import { Link } from 'react-router-dom'
import type { MenteeRecommendation } from '../../../../shared/contracts'
import ExpertiseChips from '../expertise/ExpertiseChips'
import type { MatchActionType } from '../../../../shared/contracts'
import { getMenteeRecommendationReason } from '../../utils/recommendationCopy'

interface RecommendedMenteeCardProps {
  recommendation: MenteeRecommendation
  pending: boolean
  onAction: (
    memberId: string,
    memberName: string,
    action: MatchActionType,
  ) => void
}

function RecommendedMenteeCard({
  recommendation,
  pending,
  onAction,
}: RecommendedMenteeCardProps) {
  const { mentee, sharedTopicCount, matchedTopics, sameCollege } =
    recommendation
  const hasSharedTopics = sharedTopicCount > 0 && matchedTopics.length > 0
  const evidenceAreas = hasSharedTopics
    ? matchedTopics
    : mentee.areasOfExpertise
  const evidenceLabel = hasSharedTopics
    ? 'Interests matching your experience'
    : 'Mentee interests'
  const connectionReason = getMenteeRecommendationReason(
    matchedTopics,
    sameCollege,
  )

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-heading">
        <div>
          <h3>{mentee.name}</h3>
          {mentee.gradYear ? (
            <p>St. Laurence class of {mentee.gradYear}</p>
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
            areaLabel="areas of interest"
          />
        ) : (
          <span className="directory-muted">Interests not listed yet</span>
        )}
      </div>

      <div className="recommendation-card-actions">
        <Link
          className="recommendation-profile-link"
          to={`/mentee/${mentee.id}`}
        >
          View profile and contact
        </Link>
        <div>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction(mentee.id, mentee.name, 'contacted')}
          >
            {pending ? 'Saving...' : 'Mark as contacted'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction(mentee.id, mentee.name, 'dismissed')}
          >
            Not a fit
          </button>
        </div>
      </div>
    </article>
  )
}

export default RecommendedMenteeCard
