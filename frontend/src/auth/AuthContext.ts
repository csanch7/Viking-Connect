import { createContext } from 'react'
import type { SessionResponse } from '../../../shared/contracts'

export interface AuthContextValue extends SessionResponse {
  isCheckingSession: boolean
  refreshSession: () => Promise<SessionResponse>
  markSignedOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
