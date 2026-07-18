import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import userService from '../services/userService'
import { AuthContext } from './AuthContext'
import type { SessionResponse } from '../../../shared/contracts'

const signedOutSession: SessionResponse = {
  authenticated: false,
  admin: false,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionResponse>(signedOutSession)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const refreshSession = useCallback(async () => {
    setIsCheckingSession(true)

    try {
      const nextSession = await userService.checkSession()
      setSession(nextSession)
      return nextSession
    } catch {
      setSession(signedOutSession)
      return signedOutSession
    } finally {
      setIsCheckingSession(false)
    }
  }, [])

  const markSignedOut = useCallback(() => {
    setSession(signedOutSession)
    setIsCheckingSession(false)
  }, [])

  useEffect(() => {
    let isCurrent = true

    void userService
      .checkSession()
      .then((nextSession) => {
        if (isCurrent) setSession(nextSession)
      })
      .catch(() => {
        if (isCurrent) setSession(signedOutSession)
      })
      .finally(() => {
        if (isCurrent) setIsCheckingSession(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const value = useMemo(
    () => ({
      ...session,
      isCheckingSession,
      refreshSession,
      markSignedOut,
    }),
    [isCheckingSession, markSignedOut, refreshSession, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
