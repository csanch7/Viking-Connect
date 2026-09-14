import { Link } from 'react-router-dom'
import type { Mentor } from '../../types/user'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface MentorListCardProps {
  mentor: Mentor
  onDelete: (userId: string) => void
  actionsDisabled: boolean
}

function MentorListCard({
  mentor,
  onDelete,
  actionsDisabled,
}: MentorListCardProps) {
  return (
    <article className="directory-card">
      <div className="directory-card-header">
        <div className="directory-avatar" aria-hidden="true">
          {mentor.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="directory-card-heading">
          <h3>
            <Link to={`/mentor/${mentor.id}`}>{mentor.name}</Link>
          </h3>
          <p>{mentor.email}</p>
        </div>
      </div>

      <dl className="directory-details directory-admin-details">
        <div>
          <dt>Expertise / Industries</dt>
          <dd>
            {mentor.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentor.areasOfExpertise}
                className="directory-chips"
                countClassName="directory-chip-count"
                maxVisible={2}
              />
            ) : (
              <span className="directory-muted">No areas listed yet</span>
            )}
          </dd>
        </div>
        <div className="directory-user-actions">
          <button
            className="directory-delete-button"
            type="button"
            onClick={() => onDelete(mentor.id)}
            disabled={actionsDisabled}
          >
            Delete {mentor.name}
          </button>
        </div>
      </dl>
    </article>
  )
}

export default MentorListCard
