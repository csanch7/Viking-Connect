import type { ReactNode } from 'react'

interface MemberProfileCardHeadingProps {
  action?: ReactNode
  id?: string
  kicker: string
  title: string
}

function MemberProfileCardHeading({
  action,
  id,
  kicker,
  title,
}: MemberProfileCardHeadingProps) {
  return (
    <div className="member-profile-card-heading">
      <div>
        <span>{kicker}</span>
        <h2 id={id}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default MemberProfileCardHeading
