import { useEffect, useRef } from 'react'
import type { MatchActionType } from '../../../../shared/contracts'

interface RecommendationFeedbackProps {
  notice: {
    memberId: string
    memberName: string
    action: MatchActionType | 'restored'
  } | null
  error: string
  undoing: boolean
  onUndo: () => void
}

function RecommendationFeedback({
  notice,
  error,
  undoing,
  onUndo,
}: RecommendationFeedbackProps) {
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (notice || error) feedbackRef.current?.focus()
  }, [notice, error])

  if (error) {
    return (
      <div
        ref={feedbackRef}
        className="recommendation-action-feedback is-error"
        role="alert"
        tabIndex={-1}
      >
        <p>{error}</p>
      </div>
    )
  }

  if (!notice) return null

  return (
    <div
      ref={feedbackRef}
      className="recommendation-action-feedback"
      role="status"
      tabIndex={-1}
    >
      <p>
        {notice.action === 'restored'
          ? `${notice.memberName} returned to your recommendations.`
          : notice.action === 'contacted'
            ? `${notice.memberName} was added to your contact history.`
            : `${notice.memberName} was hidden from your recommendations.`}
      </p>
      {notice.action !== 'restored' && (
        <button type="button" onClick={onUndo} disabled={undoing}>
          {undoing ? 'Undoing...' : 'Undo'}
        </button>
      )}
    </div>
  )
}

export default RecommendationFeedback
