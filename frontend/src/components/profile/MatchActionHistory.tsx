import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  MatchActionEntry,
  MatchActionType,
} from '../../../../shared/contracts'
import userService from '../../services/userService'

function formatActionDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

interface MatchActionListProps {
  action: MatchActionType
  title: string
  description: string
}

function MatchActionList({ action, title, description }: MatchActionListProps) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const historyQuery = useQuery({
    queryKey: ['matchActions', action, page],
    queryFn: () => userService.getMatchActions(action, page),
  })

  async function removeEntry(entry: MatchActionEntry) {
    setPendingId(entry.member.id)
    setError('')
    setMessage('')

    try {
      await userService.deleteMatchAction(entry.member.id)
      setMessage(
        action === 'contacted'
          ? `${entry.member.name} was removed from your contact history.`
          : `${entry.member.name} can appear in your recommendations again.`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['matchActions'] }),
        queryClient.invalidateQueries({ queryKey: ['matchAction'] }),
        queryClient.invalidateQueries({ queryKey: ['mentorRecommendations'] }),
        queryClient.invalidateQueries({ queryKey: ['menteeRecommendations'] }),
      ])
    } catch {
      setError('We could not update your match history. Please try again.')
    } finally {
      setPendingId(null)
    }
  }

  const entries = historyQuery.data?.entries ?? []

  return (
    <section
      className="match-history-group"
      aria-labelledby={`${action}-title`}
    >
      <div className="match-history-group-heading">
        <div>
          <h3 id={`${action}-title`}>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      {message && (
        <p className="match-history-message" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="match-history-message is-error" role="alert">
          {error}
        </p>
      )}

      {historyQuery.isPending ? (
        <p className="match-history-state" role="status">
          Loading {title.toLowerCase()}...
        </p>
      ) : historyQuery.isError ? (
        <div className="match-history-state is-error" role="alert">
          <p>We could not load this history.</p>
          <button type="button" onClick={() => void historyQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <p className="match-history-state">
          {action === 'contacted'
            ? 'People you contact will appear here.'
            : 'Recommendations you mark as not a fit will appear here.'}
        </p>
      ) : (
        <ul className="match-history-list">
          {entries.map((entry) => (
            <li key={entry.member.id}>
              <div>
                <Link to={`/${entry.member.type}/${entry.member.id}`}>
                  {entry.member.name}
                </Link>
                <p>
                  {action === 'contacted' ? 'Contacted' : 'Hidden'}{' '}
                  {formatActionDate(entry.actedAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={pendingId === entry.member.id}
                onClick={() => void removeEntry(entry)}
              >
                {pendingId === entry.member.id
                  ? 'Updating...'
                  : action === 'contacted'
                    ? 'Remove from history'
                    : 'Restore'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {(page > 0 || historyQuery.data?.hasNextPage) && (
        <div className="match-history-pagination">
          <span>Page {page + 1}</span>
          <div>
            {page > 0 && (
              <button type="button" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            )}
            {historyQuery.data?.hasNextPage && (
              <button type="button" onClick={() => setPage(page + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function MatchActionHistory() {
  return (
    <section
      className="member-profile-card match-history"
      id="contact-history"
      aria-labelledby="match-history-title"
    >
      <header className="match-history-heading">
        <h2 id="match-history-title">Your match history</h2>
        <p>
          Keep track of outreach and restore recommendations whenever you need
          to.
        </p>
      </header>
      <MatchActionList
        action="contacted"
        title="People you contacted"
        description="A private record of the people you marked after reaching out."
      />
      <MatchActionList
        action="dismissed"
        title="Hidden recommendations"
        description="People you marked as not a fit. Only you can see this list."
      />
    </section>
  )
}

export default MatchActionHistory
