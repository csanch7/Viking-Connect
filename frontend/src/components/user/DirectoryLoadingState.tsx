interface DirectoryLoadingStateProps {
  memberType: 'mentors' | 'mentees'
}

const skeletonRows = [0, 1, 2]

function DirectoryLoadingState({ memberType }: DirectoryLoadingStateProps) {
  const singularMemberType = memberType === 'mentors' ? 'mentor' : 'mentee'

  return (
    <section
      className="directory-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${memberType}`}
    >
      <p className="sr-only">
        Gathering approved {singularMemberType} profiles.
      </p>

      <div
        className="directory-controls directory-loading-controls"
        aria-hidden="true"
      >
        <div className="directory-loading-heading">
          <span className="directory-skeleton directory-skeleton-title" />
          <span className="directory-skeleton directory-skeleton-copy" />
        </div>

        <div className="directory-search-row">
          <div className="directory-loading-field">
            <span className="directory-skeleton directory-skeleton-label" />
            <span className="directory-skeleton directory-skeleton-input" />
          </div>
          <span className="directory-skeleton directory-skeleton-button" />
        </div>
      </div>

      <div
        className="directory-directory directory-loading-directory"
        aria-hidden="true"
      >
        <div className="directory-directory-header">
          <div className="directory-loading-heading">
            <span className="directory-skeleton directory-skeleton-section-title" />
            <span className="directory-skeleton directory-skeleton-copy directory-skeleton-copy-short" />
          </div>
          <span className="directory-skeleton directory-skeleton-badge" />
        </div>

        <div className="directory-list">
          {skeletonRows.map((row) => (
            <div
              className="directory-card directory-loading-skeleton-row"
              key={row}
            >
              <div className="directory-card-header">
                <span className="directory-skeleton directory-skeleton-avatar" />
                <div className="directory-loading-identity">
                  <span className="directory-skeleton directory-skeleton-name" />
                  <span className="directory-skeleton directory-skeleton-meta" />
                </div>
              </div>

              <div className="directory-details">
                <div>
                  <span className="directory-skeleton directory-skeleton-detail-label" />
                  <div className="directory-loading-chips">
                    <span className="directory-skeleton directory-skeleton-chip" />
                    <span className="directory-skeleton directory-skeleton-chip directory-skeleton-chip-short" />
                  </div>
                </div>
                <div>
                  <span className="directory-skeleton directory-skeleton-detail-label" />
                  <span className="directory-skeleton directory-skeleton-link" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="directory-loading-caption" aria-hidden="true">
        Gathering approved {singularMemberType} profiles…
      </p>
    </section>
  )
}

export default DirectoryLoadingState
