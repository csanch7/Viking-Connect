import type { PendingUser } from '../../types/pendingUser'

interface PendingUserCardProps {
  user: PendingUser
  onApprove: (userId: string) => void
  onDeny: (userId: string) => void
}

function PendingUserCard({ user, onApprove, onDeny }: PendingUserCardProps) {
  return (
    <article className="pending-user-card">
      <div className="pending-user-header">
        <div className="pending-user-avatar" aria-hidden="true">
          {user.username.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span className="pending-user-status">Pending review</span>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <dl className="pending-user-details">
        <div>
          <dt>Program role</dt>
          <dd>{user.type}</dd>
        </div>
        <div>
          <dt>Graduation year</dt>
          <dd>{user.gradYear}</dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            <a href={user.linkedin} target="_blank" rel="noreferrer">
              {user.linkedin}
            </a>
          </dd>
        </div>
        <div className="pending-user-detail-wide">
          <dt>
            {user.type === 'mentor'
              ? 'Areas of expertise'
              : 'Requested support'}
          </dt>
          <dd>
            {user.type === 'mentor'
              ? user.areasOfExpertise.join(', ') || 'No areas listed'
              : user.helpText || 'No details provided'}
          </dd>
        </div>
      </dl>

      <div className="pending-user-actions">
        <button className="pending-user-deny" onClick={() => onDeny(user.id)}>
          Deny
        </button>
        <button
          className="pending-user-approve"
          onClick={() => onApprove(user.id)}
        >
          Approve
        </button>
      </div>
    </article>
  )
}

export default PendingUserCard
