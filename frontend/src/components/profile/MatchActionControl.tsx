import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MatchActionType } from '../../../../shared/contracts'
import userService from '../../services/userService'

interface MatchActionControlProps {
  memberId: string
  memberName: string
}

function formatContactDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function MatchActionControl({ memberId, memberName }: MatchActionControlProps) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const statusQuery = useQuery({
    queryKey: ['matchAction', memberId],
    queryFn: () => userService.getMatchAction(memberId),
  })

  async function refreshTracking() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['matchAction', memberId] }),
      queryClient.invalidateQueries({ queryKey: ['matchActions'] }),
      queryClient.invalidateQueries({ queryKey: ['mentorRecommendations'] }),
      queryClient.invalidateQueries({ queryKey: ['menteeRecommendations'] }),
    ])
  }

  async function setAction(action: MatchActionType) {
    setPending(true)
    setError('')

    try {
      await userService.setMatchAction(memberId, action)
      await refreshTracking()
    } catch {
      setError(
        action === 'contacted'
          ? `We could not add ${memberName} to your contact history.`
          : `We could not hide ${memberName} from your recommendations.`,
      )
    } finally {
      setPending(false)
    }
  }

  async function removeAction() {
    setPending(true)
    setError('')

    try {
      await userService.deleteMatchAction(memberId)
      await refreshTracking()
    } catch {
      setError('We could not update your match history. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (statusQuery.isPending) {
    return (
      <p className="match-action-control-state" role="status">
        Checking your match history...
      </p>
    )
  }

  if (statusQuery.isError) {
    return (
      <div className="match-action-control-state is-error" role="alert">
        <p>We could not check your match history.</p>
        <button type="button" onClick={() => void statusQuery.refetch()}>
          Try again
        </button>
      </div>
    )
  }

  const status = statusQuery.data

  return (
    <div className="match-action-control">
      {status?.action === 'contacted' ? (
        <div>
          <p>
            <strong>Contacted</strong>
            {status.actedAt && ` ${formatContactDate(status.actedAt)}`}
          </p>
          <button type="button" disabled={pending} onClick={removeAction}>
            {pending ? 'Removing...' : 'Remove from history'}
          </button>
        </div>
      ) : status?.action === 'dismissed' ? (
        <div>
          <p>
            <strong>Hidden from recommendations</strong>
          </p>
          <span className="match-action-control-actions">
            <button
              type="button"
              disabled={pending}
              onClick={() => void setAction('contacted')}
            >
              {pending ? 'Saving...' : 'Mark as contacted'}
            </button>
            <button type="button" disabled={pending} onClick={removeAction}>
              Restore recommendation
            </button>
          </span>
        </div>
      ) : (
        <div>
          <p>Keep your recommendations current after you reach out.</p>
          <span className="match-action-control-actions">
            <button
              type="button"
              disabled={pending}
              onClick={() => void setAction('contacted')}
            >
              {pending ? 'Saving...' : 'Mark as contacted'}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void setAction('dismissed')}
            >
              Not a fit
            </button>
          </span>
        </div>
      )}
      {error && (
        <p className="match-action-control-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default MatchActionControl
