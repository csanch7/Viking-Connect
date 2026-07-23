import type { PublicUser } from '../../../../shared/contracts'
import MemberProfileCardHeading from './MemberProfileCardHeading'

interface MemberProfileSummaryProps {
  user: Pick<PublicUser, 'gradYear' | 'id' | 'type'>
}

function MemberProfileSummary({ user }: MemberProfileSummaryProps) {
  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'

  return (
    <aside className="member-profile-side-column" aria-label="Profile summary">
      <section className="member-profile-card member-profile-summary-card">
        <MemberProfileCardHeading kicker="Program" title="Snapshot" />
        <dl className="member-profile-summary-list">
          <div>
            <dt>Role</dt>
            <dd>{memberType}</dd>
          </div>
          <div>
            <dt>Graduation year</dt>
            <dd>{user.gradYear || 'Not listed'}</dd>
          </div>
          <div>
            <dt>Member</dt>
            <dd>#{user.id}</dd>
          </div>
        </dl>
      </section>
    </aside>
  )
}

export default MemberProfileSummary
