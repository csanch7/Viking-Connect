import type { PublicUser } from '../../../../shared/contracts'
import MemberProfileCardHeading from './MemberProfileCardHeading'
import MatchActionControl from './MatchActionControl'

interface MemberProfileContactProps {
  user: Pick<PublicUser, 'email' | 'linkedin'>
  tracking?: { memberId: string; memberName: string }
}

function MemberProfileContact({ user, tracking }: MemberProfileContactProps) {
  return (
    <section
      className="member-profile-card"
      aria-labelledby="member-contact-title"
    >
      <MemberProfileCardHeading
        id="member-contact-title"
        kicker="Contact"
        title="Get in touch"
      />
      <dl className="member-profile-details">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            {user.linkedin ? (
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                View profile <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="member-profile-muted">Not added</span>
            )}
          </dd>
        </div>
      </dl>
      {tracking && (
        <MatchActionControl
          memberId={tracking.memberId}
          memberName={tracking.memberName}
        />
      )}
    </section>
  )
}

export default MemberProfileContact
