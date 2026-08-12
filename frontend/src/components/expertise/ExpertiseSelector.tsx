import { useEffect, useState } from 'react'
import topicService from '../../services/topicService'

interface ExpertiseSelectorProps {
  selectId: string
  selectedAreas: string[]
  selectedArea: string
  onSelectedAreaChange: (area: string) => void
  onAddArea: () => void
  onRemoveArea: (area: string) => void
  label?: string
  className?: string
}

function ExpertiseSelector({
  selectId,
  selectedAreas,
  selectedArea,
  onSelectedAreaChange,
  onAddArea,
  onRemoveArea,
  label = 'Select an area',
  className,
}: ExpertiseSelectorProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let isCurrent = true

    void topicService
      .getTopics()
      .then((nextTopics) => {
        if (isCurrent) {
          setTopics(nextTopics)
          setLoadError('')
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTopics([])
          setLoadError('We could not load mentorship topics.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [loadAttempt])

  function retryLoadingTopics() {
    setLoading(true)
    setLoadError('')
    setLoadAttempt((attempt) => attempt + 1)
  }
  return (
    <>
      <div
        className={`register-expertise-row${className ? ` ${className}` : ''}`}
      >
        <label className="register-field" htmlFor={selectId}>
          <span>{label}</span>
          <div className="register-expertise-control">
            <select
              id={selectId}
              name={selectId}
              value={selectedArea}
              onChange={(event) => onSelectedAreaChange(event.target.value)}
              disabled={loading || Boolean(loadError)}
              aria-describedby={loadError ? `${selectId}-error` : undefined}
            >
              <option value="" disabled>
                {loading
                  ? 'Loading topics...'
                  : loadError
                    ? 'Topics unavailable'
                    : 'Choose a topic'}
              </option>
              {topics
                .filter((area) => !selectedAreas.includes(area))
                .map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
            </select>

            <button
              className="register-secondary-button"
              type="button"
              onClick={onAddArea}
              disabled={loading || Boolean(loadError) || !selectedArea}
            >
              Add
            </button>
          </div>
          {loadError && (
            <div className="register-field-recovery" id={`${selectId}-error`}>
              <small role="alert">
                {loadError} Topics are required to complete your profile.
              </small>
              <button
                className="inline-retry-button"
                type="button"
                onClick={retryLoadingTopics}
              >
                Try loading topics again
              </button>
            </div>
          )}
        </label>
      </div>

      {selectedAreas.length > 0 && (
        <ul className="register-chip-list" aria-label="Selected topics">
          {selectedAreas.map((area) => (
            <li key={area}>
              <span>{area}</span>
              <button
                type="button"
                onClick={() => onRemoveArea(area)}
                aria-label={`Remove ${area}`}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                  <path d="m6 6 8 8M14 6l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ExpertiseSelector
