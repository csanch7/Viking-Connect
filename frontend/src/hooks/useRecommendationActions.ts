import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { MatchActionType } from '../../../shared/contracts'
import userService from '../services/userService'

interface RecommendationNotice {
  memberId: string
  memberName: string
  action: MatchActionType | 'restored'
}

export function useRecommendationActions(recommendationQueryKey: string) {
  const queryClient = useQueryClient()
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null)
  const [notice, setNotice] = useState<RecommendationNotice | null>(null)
  const [error, setError] = useState('')

  async function refreshRecommendations() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [recommendationQueryKey] }),
      queryClient.invalidateQueries({ queryKey: ['matchActions'] }),
      queryClient.invalidateQueries({ queryKey: ['matchAction'] }),
    ])
  }

  async function setAction(
    memberId: string,
    memberName: string,
    action: MatchActionType,
  ) {
    setPendingMemberId(memberId)
    setError('')

    try {
      await userService.setMatchAction(memberId, action)
      setNotice({ memberId, memberName, action })
      await refreshRecommendations()
    } catch {
      setError(
        action === 'contacted'
          ? `We could not mark ${memberName} as contacted. Please try again.`
          : `We could not hide ${memberName}. Please try again.`,
      )
    } finally {
      setPendingMemberId(null)
    }
  }

  async function undo() {
    if (!notice) return

    setPendingMemberId(notice.memberId)
    setError('')

    try {
      await userService.deleteMatchAction(notice.memberId)
      await refreshRecommendations()
      setNotice({ ...notice, action: 'restored' })
    } catch {
      setError('We could not undo that change. Please try again.')
    } finally {
      setPendingMemberId(null)
    }
  }

  return { pendingMemberId, notice, error, setAction, undo }
}
