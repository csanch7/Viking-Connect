import type { ReactNode } from 'react'
import type { PublicUser } from '../../../../shared/contracts'

interface MemberProfileHeroProps {
  action?: ReactNode
  titleId?: string
  user: Pick<PublicUser, 'name' | 'type'>
}

function MemberProfileHero({ action, titleId, user }: MemberProfileHeroProps) {
  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'

  return (
    <section
      className="member-profile-hero member-profile-card"
      aria-labelledby={titleId}
    >
      <div className="member-profile-cover" aria-hidden="true" />
      <div className="member-profile-identity">
        <div className="member-profile-avatar" aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="member-profile-heading">
          <p className="member-profile-eyebrow">{memberType} profile</p>
          <h1 id={titleId}>{user.name}</h1>
          <p>{memberType} in the STL Mentorship Program</p>
        </div>
        {action && <div className="member-profile-actions">{action}</div>}
      </div>
    </section>
  )
}

export default MemberProfileHero
