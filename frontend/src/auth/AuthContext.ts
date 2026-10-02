import { createContext } from 'react'
import type { SessionResponse, UserType } from '../../../shared/contracts'

export interface AuthContextValue extends SessionResponse {
  isCheckingSession: boolean
  refreshSession: () => Promise<SessionResponse>
  setMentorshipType: (type: UserType) => void
  markSignedOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
