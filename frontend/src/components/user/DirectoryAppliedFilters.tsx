interface DirectoryAppliedFiltersProps {
  searchText: string
  expertise: string[]
  college: string
  topicLabel: string
  onClear: () => void
}

function DirectoryAppliedFilters({
  searchText,
  expertise,
  college,
  topicLabel,
  onClear,
}: DirectoryAppliedFiltersProps) {
  const trimmedSearch = searchText.trim()
  const hasFilters = Boolean(trimmedSearch || expertise.length || college)

  if (!hasFilters) return null

  return (
    <section className="directory-applied-filters" aria-label="Active filters">
      <div>
        <strong>Showing a filtered directory</strong>
        <ul>
          {trimmedSearch && <li>Name: “{trimmedSearch}”</li>}
          {expertise.map((area) => (
            <li key={area}>
              {topicLabel}: {area}
            </li>
          ))}
          {college && <li>College: {college}</li>}
        </ul>
      </div>
      <button type="button" onClick={onClear}>
        Clear all filters
      </button>
    </section>
  )
}

export default DirectoryAppliedFilters
