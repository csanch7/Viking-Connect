import { Link } from 'react-router-dom'
import type { Mentee, Mentor } from '../../types/user'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface UserDirectoryCardProps {
  user: Mentor | Mentee
}

function UserDirectoryCard({ user }: UserDirectoryCardProps) {
  return (
    <article className="directory-card">
      <div className="directory-card-header">
        <div className="directory-avatar" aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="directory-card-heading">
          <h3>
            {user.type === 'mentor' ? (
              <Link to={`/mentor/${user.id}`}>{user.name}</Link>
            ) : (
              <Link to={`/mentee/${user.id}`}>{user.name}</Link>
            )}
          </h3>
          <p>St. Laurence class of {user.gradYear}</p>
        </div>
      </div>

      <dl className="directory-details">
        <div>
          <dt>{user.type === 'mentor' ? 'Expertise' : 'Interests'}</dt>
          <dd>
            {user.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={user.areasOfExpertise}
                className="directory-chips"
                countClassName="directory-chip-count"
                maxVisible={2}
              />
            ) : (
              <span className="directory-muted">
                {user.type === 'mentor'
                  ? 'No areas listed yet'
                  : 'No interests listed yet'}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Connect</dt>
          <dd>
            <span className="directory-contact-links">
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </span>
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default UserDirectoryCard
