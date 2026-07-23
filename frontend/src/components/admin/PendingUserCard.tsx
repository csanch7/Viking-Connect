import type { PendingUser } from '../../types/pendingUser'

interface PendingUserCardProps {
  user: PendingUser
  onApprove: (userId: string) => void
  onDeny: (userId: string) => void
  onCancelDeny: () => void
  confirmDeny: boolean
  activeAction?: 'approve' | 'deny'
}

function PendingUserCard({
  user,
  onApprove,
  onDeny,
  onCancelDeny,
  confirmDeny,
  activeAction,
}: PendingUserCardProps) {
  return (
    <article className="pending-user-card">
      <div className="pending-user-header">
        <div className="pending-user-avatar" aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span className="pending-user-status">Pending review</span>
          <h2>{user.name}</h2>
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
              View LinkedIn profile <span aria-hidden="true">↗</span>
            </a>
          </dd>
        </div>
        <div className="pending-user-detail-wide">
          <dt>Bio</dt>
          <dd>{user.bio || 'No bio provided'}</dd>
        </div>
        <div className="pending-user-detail-wide">
          <dt>
            Areas of {user.type === 'mentor' ? 'expertise' : 'interest'}
          </dt>
          <dd>{user.areasOfExpertise.join(', ') || 'No areas listed'}</dd>
        </div>
      </dl>

      {confirmDeny ? (
        <div
          className="pending-user-confirmation"
          role="group"
          aria-label={`Confirm denial for ${user.name}`}
        >
          <p>This removes the registration from the review queue. Continue?</p>
          <div className="pending-user-actions">
            <button
              className="pending-user-secondary"
              type="button"
              onClick={onCancelDeny}
              disabled={Boolean(activeAction)}
            >
              Cancel
            </button>
            <button
              className="pending-user-deny"
              type="button"
              onClick={() => onDeny(user.id)}
              disabled={Boolean(activeAction)}
            >
              {activeAction === 'deny' ? 'Denying...' : 'Confirm denial'}
            </button>
          </div>
        </div>
      ) : (
        <div className="pending-user-actions">
        <button
          className="pending-user-deny"
          type="button"
          onClick={() => onDeny(user.id)}
          disabled={Boolean(activeAction)}
        >
          Deny
        </button>
        <button
          className="pending-user-approve"
          type="button"
          onClick={() => onApprove(user.id)}
          disabled={Boolean(activeAction)}
        >
          {activeAction === 'approve' ? 'Approving...' : 'Approve'}
        </button>
        </div>
      )}
    </article>
  )
}

export default PendingUserCard
