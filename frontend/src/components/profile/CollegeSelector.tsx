import { useEffect, useState } from 'react'
import collegeService from '../../services/collegeService'

interface CollegeSelectorProps {
  selectId: string
  value: string
  onChange: (college: string) => void
  emptyLabel?: string
  supportingText?: string
}

function CollegeSelector({
  selectId,
  value,
  onChange,
  emptyLabel = 'No college selected',
  supportingText = 'You can update this selection at any time.',
}: CollegeSelectorProps) {
  const [colleges, setColleges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isCurrent = true

    void collegeService
      .getColleges()
      .then((nextColleges) => {
        if (isCurrent) {
          setColleges(nextColleges)
          setLoadError('')
        }
      })
      .catch(() => {
        if (isCurrent) {
          setColleges([])
          setLoadError('We could not load colleges. Please try again.')
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
    <div className="college-field">
      <label className="college-field-label" htmlFor={selectId}>
        College
      </label>
      <div className="college-select-shell">
        <select
          className="college-select"
          id={selectId}
          name={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading || Boolean(loadError)}
          aria-describedby={`${selectId}-${loadError ? 'error' : 'help'}`}
        >
          <option value="">
            {loading
              ? 'Loading colleges...'
              : loadError
                ? 'Colleges unavailable'
                : emptyLabel}
          </option>
          {colleges.map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>
        <svg
          className="college-select-icon"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="m6 8 4 4 4-4" />
        </svg>
      </div>
      {loadError ? (
        <p
          className="college-field-message college-field-message--error"
          id={`${selectId}-error`}
          role="alert"
        >
          {loadError}
        </p>
      ) : (
        <p className="college-field-message" id={`${selectId}-help`}>
          {supportingText}
        </p>
      )}
    </div>
  )
}

export default CollegeSelector
