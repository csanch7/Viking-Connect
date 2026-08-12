import type { PublicUser } from '../../../../shared/contracts'
import type { ReactNode } from 'react'
import MemberProfileCardHeading from './MemberProfileCardHeading'

interface MemberProfileSummaryProps {
  user: Pick<PublicUser, 'gradYear' | 'type' | 'college'>
  collegeEditor?: ReactNode
}

function MemberProfileSummary({
  user,
  collegeEditor,
}: MemberProfileSummaryProps) {
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
            <dd>{user.gradYear}</dd>
          </div>
          {!collegeEditor && (
            <div>
              <dt>College</dt>
              <dd>{user.college || 'Not listed'}</dd>
            </div>
          )}
        </dl>
        {collegeEditor}
      </section>
    </aside>
  )
}

export default MemberProfileSummary
