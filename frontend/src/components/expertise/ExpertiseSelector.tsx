import { areasOfExpertise } from '../../constants/areasOfExpertise'

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
            >
              <option value="" disabled>
                Choose expertise
              </option>
              {areasOfExpertise.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <button
              className="register-secondary-button"
              type="button"
              onClick={onAddArea}
            >
              Add
            </button>
          </div>
        </label>
      </div>

      {selectedAreas.length > 0 && (
        <ul className="register-chip-list" aria-label="Selected expertise">
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
