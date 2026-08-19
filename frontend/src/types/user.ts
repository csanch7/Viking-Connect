export type { RegistrationRequest as User } from '../../../shared/contracts'
import type {
  MenteeDirectoryUser,
  MentorDirectoryUser,
} from '../../../shared/contracts'

export type Mentor = MentorDirectoryUser
export type Mentee = MenteeDirectoryUser

export const communityMemberTypes = [
  'Alumnus',
  'Current Student',
  'Faculty or Staff',
  'Community Member',
] as const

export type CommunityMemberType = (typeof communityMemberTypes)[number]
