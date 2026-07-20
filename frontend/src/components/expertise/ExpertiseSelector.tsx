import { useEffect, useState } from 'react'
import topicService from '../../services/topicService'

interface ExpertiseSelectorProps {
  selectId: string
  selectedAreas: string[]
  selectedArea: string
  onSelectedAreaChange: (area: string) => void
  onAddArea: () => void
  onRemoveArea: (area: string) => void
}

function ExpertiseSelector({
  selectId,
  selectedAreas,
  selectedArea,
  onSelectedAreaChange,
  onAddArea,
  onRemoveArea,
}: ExpertiseSelectorProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

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
          setLoadError('We could not load topics. Please refresh and try again.')
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])
  return (
    <>
      <div className="register-expertise-row">
        <label className="register-field" htmlFor={selectId}>
          <span>Select an area</span>
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
              {topics.map((area) => (
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
            <small id={`${selectId}-error`} role="alert">
              {loadError}
            </small>
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
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ExpertiseSelector
