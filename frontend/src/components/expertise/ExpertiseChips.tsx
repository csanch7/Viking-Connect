interface ExpertiseChipsProps {
  areas: string[]
  className: string
  countClassName?: string
  maxVisible?: number
}

function ExpertiseChips({
  areas,
  className,
  countClassName,
  maxVisible,
}: ExpertiseChipsProps) {
  const visibleAreas =
    typeof maxVisible === 'number' ? areas.slice(0, maxVisible) : areas
  const hiddenAreaCount = areas.length - visibleAreas.length

  return (
    <ul className={className}>
      {visibleAreas.map((area) => (
        <li key={area}>{area}</li>
      ))}
      {hiddenAreaCount > 0 && (
        <li
          className={countClassName}
          aria-label={`${hiddenAreaCount} more areas of expertise`}
        >
          +{hiddenAreaCount}
        </li>
      )}
    </ul>
  )
}

export default ExpertiseChips
