import { Link } from 'react-router-dom'
import type { Mentor } from '../../types/mentor'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface MentorDirectoryCardProps {
  mentor: Mentor
}

function MentorDirectoryCard({ mentor }: MentorDirectoryCardProps) {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="dashboard-avatar" aria-hidden="true">
          {mentor.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="dashboard-card-heading">
          <h3>
            <Link to={`/mentor/${mentor.id}`}>{mentor.username}</Link>
          </h3>
          <p>{mentor.email}</p>
        </div>
      </div>

      <dl className="dashboard-details">
        <div>
          <dt>Expertise</dt>
          <dd>
            {mentor.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={mentor.areasOfExpertise}
                className="dashboard-chips"
                countClassName="dashboard-chip-count"
                maxVisible={2}
              />
            ) : (
              <span className="dashboard-muted">No areas listed yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            {mentor.linkedin ? (
              <a href={mentor.linkedin} target="_blank" rel="noreferrer">
                View profile <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="dashboard-muted">Not added</span>
            )}
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default MentorDirectoryCard
