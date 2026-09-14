import { useRef, useState, type KeyboardEvent } from 'react'
import { useCollegesQuery } from '../hooks/useCollegesQuery'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

interface CollegeSelectorProps {
  selectId: string
  value: string
  onChange: (college: string) => void
  label?: string
  emptyLabel?: string
  supportingText?: string
  className?: string
}

function CollegeCombobox({
  selectId,
  value,
  onChange,
  label = 'College',
  emptyLabel = 'No college selected',
  supportingText = 'You can update this selection at any time.',
  className,
}: CollegeSelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const normalizedInput = inputValue.trim()
  const searchText = normalizedInput === value ? '' : normalizedInput
  const debouncedSearchText = useDebouncedValue(searchText)
  const waitingForSearch = searchText !== debouncedSearchText
  const collegesQuery = useCollegesQuery(debouncedSearchText)
  const colleges = collegesQuery.data ?? []
  const loading =
    waitingForSearch || collegesQuery.isPending || collegesQuery.isFetching
  const loadError = collegesQuery.isError ? 'We could not load colleges.' : ''
  const descriptionId = loadError
    ? `${selectId}-error`
    : supportingText
      ? `${selectId}-help`
      : undefined
  const listboxId = `${selectId}-options`
  const activeOptionId =
    activeIndex >= 0 && activeIndex < colleges.length
      ? `${selectId}-option-${activeIndex}`
      : undefined

  function selectCollege(college: string) {
    setInputValue(college)
    setOpen(false)
    setActiveIndex(-1)
    onChange(college)
  }

  function clearCollege() {
    setInputValue('')
    setOpen(true)
    setActiveIndex(-1)
    onChange('')
  }

  function closeAndRestore() {
    const exactMatch = colleges.find(
      (college) => college.toLowerCase() === normalizedInput.toLowerCase(),
    )

    if (!normalizedInput) {
      selectCollege('')
    } else if (exactMatch) {
      selectCollege(exactMatch)
    } else {
      setInputValue(value)
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) =>
        colleges.length ? (index + 1) % colleges.length : -1,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) =>
        colleges.length ? (index <= 0 ? colleges.length : index) - 1 : -1,
      )
      return
    }

    if (event.key === 'Enter' && open) {
      event.preventDefault()
      if (activeIndex >= 0 && colleges[activeIndex]) {
        selectCollege(colleges[activeIndex])
      } else {
        closeAndRestore()
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setInputValue(value)
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div
      className={`college-field${className ? ` ${className}` : ''}`}
      ref={rootRef}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget)) {
          closeAndRestore()
        }
      }}
    >
      <label className="college-field-label" htmlFor={selectId}>
        {label}
      </label>
      <div className="college-combobox-shell">
        <input
          className="college-combobox-input"
          id={selectId}
          type="text"
          role="combobox"
          value={inputValue}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setInputValue(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder={emptyLabel}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-busy={loading}
          aria-describedby={descriptionId}
          autoComplete="off"
          maxLength={100}
          spellCheck={false}
        />
        {inputValue ? (
          <button
            className="college-combobox-clear"
            type="button"
            aria-label="Clear college"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearCollege}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path d="m6 6 8 8M14 6l-8 8" />
            </svg>
          </button>
        ) : (
          <svg
            className="college-combobox-icon"
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path d="m6 8 4 4 4-4" />
          </svg>
        )}

        {open && (
          <div
            className="college-combobox-menu"
            id={listboxId}
            role="listbox"
            aria-label="College options"
          >
            {loading ? (
              <div
                className="college-combobox-state"
                role="option"
                aria-disabled="true"
                aria-selected="false"
              >
                <span role="status">
                  {debouncedSearchText
                    ? 'Searching colleges...'
                    : 'Loading colleges...'}
                </span>
              </div>
            ) : loadError ? (
              <div
                className="college-combobox-state"
                role="option"
                aria-disabled="true"
                aria-selected="false"
              >
                Colleges unavailable
              </div>
            ) : colleges.length === 0 ? (
              <div
                className="college-combobox-state"
                role="option"
                aria-disabled="true"
                aria-selected="false"
              >
                No colleges found
              </div>
            ) : (
              <>
                {colleges.map((college, index) => (
                  <div
                    id={`${selectId}-option-${index}`}
                    key={college}
                    role="option"
                    aria-selected={college === value}
                    className={index === activeIndex ? 'is-active' : undefined}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectCollege(college)}
                  >
                    {college}
                    {college === value && (
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                        <path d="m5 10 3 3 7-7" />
                      </svg>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {loadError ? (
        <div className="college-field-recovery" id={`${selectId}-error`}>
          <p
            className="college-field-message college-field-message--error"
            role="alert"
          >
            {loadError} You can continue without a college selection.
          </p>
          <button
            className="inline-retry-button"
            type="button"
            onClick={() => void collegesQuery.refetch()}
          >
            Try loading colleges again
          </button>
        </div>
      ) : (
        supportingText && (
          <p className="college-field-message" id={`${selectId}-help`}>
            {supportingText}
          </p>
        )
      )}
    </div>
  )
}

function CollegeSelector(props: CollegeSelectorProps) {
  return <CollegeCombobox key={props.value} {...props} />
}

export default CollegeSelector
