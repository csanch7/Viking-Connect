import { Link } from 'react-router-dom'
import type { Mentee } from '../../types/user'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface MenteeListCardProps {
  mentee: Mentee
  onDelete: (userId: string) => void
  actionsDisabled: boolean
}

function MenteeListCard({
  mentee,
  onDelete,
  actionsDisabled,
}: MenteeListCardProps) {
  return (
    <article className="directory-card">
      <div className="directory-card-header">
        <div className="directory-avatar" aria-hidden="true">
          {mentee.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="directory-card-heading">
          <h3>
            <Link to={`/mentee/${mentee.id}`}>{mentee.name}</Link>
          </h3>
          <p>{mentee.email}</p>
        </div>
      </div>

      <dl className="directory-details directory-admin-details">
        <div>
          <dt>Interests</dt>
          <dd>
            {mentee.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentee.areasOfExpertise}
                className="directory-chips"
                countClassName="directory-chip-count"
                maxVisible={2}
                areaLabel="areas of interest"
              />
            ) : (
              <span className="directory-muted">No interests listed yet</span>
            )}
          </dd>
        </div>
        <div className="directory-user-actions">
          <button
            className="directory-delete-button"
            type="button"
            onClick={() => onDelete(mentee.id)}
            disabled={actionsDisabled}
          >
            Delete {mentee.name}
          </button>
        </div>
      </dl>
    </article>
  )
}

export default MenteeListCard
