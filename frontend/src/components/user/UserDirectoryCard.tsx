import { Link } from 'react-router-dom'
import type { Mentee, Mentor } from '../../types/user'
import ExpertiseChips from '../expertise/ExpertiseChips'

interface UserDirectoryCardProps {
  user: Mentor | Mentee
}

function UserDirectoryCard({ user }: UserDirectoryCardProps) {
  const profilePath =
    user.type === 'mentor' ? `/mentor/${user.id}` : `/mentee/${user.id}`

  return (
    <article className="directory-card">
      <div className="directory-card-header">
        <div className="directory-avatar" aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="directory-card-heading">
          <h3>
            <Link className="directory-profile-link" to={profilePath}>
              {user.name}
            </Link>
          </h3>
          {user.gradYear ? (
            <p>St. Laurence class of {user.gradYear}</p>
          ) : (
            <p>Community member</p>
          )}
        </div>
      </div>

      <dl className="directory-details">
        <div>
          <dt>
            {user.type === 'mentor' ? 'Expertise / Industries' : 'Interests'}
          </dt>
          <dd>
            {user.areasOfExpertise.length > 0 ? (
              <ExpertiseChips
                areas={user.areasOfExpertise}
                className="directory-chips"
                countClassName="directory-chip-count"
                maxVisible={2}
                areaLabel={
                  user.type === 'mentor'
                    ? 'areas of expertise / industries'
                    : 'areas of interest'
                }
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
              <a
                className="directory-external-link"
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
              >
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
