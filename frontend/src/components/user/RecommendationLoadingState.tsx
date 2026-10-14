const recommendationSkeletons = [0, 1, 2]

function RecommendationLoadingState({
  memberType,
}: {
  memberType: 'mentor' | 'mentee'
}) {
  return (
    <div
      className="recommendations-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${memberType} recommendations`}
    >
      <p className="sr-only">Finding your top {memberType} matches.</p>
      <div className="recommendations-grid" aria-hidden="true">
        {recommendationSkeletons.map((skeleton) => (
          <div
            className="recommendation-card recommendation-card--loading"
            key={skeleton}
          >
            <div className="recommendation-loading-heading">
              <span className="directory-skeleton recommendation-skeleton-name" />
              <span className="directory-skeleton recommendation-skeleton-meta" />
            </div>
            <span className="directory-skeleton recommendation-skeleton-reason" />
            <div className="recommendation-loading-evidence">
              <span className="directory-skeleton recommendation-skeleton-label" />
              <div className="recommendation-loading-chips">
                <span className="directory-skeleton recommendation-skeleton-chip" />
                <span className="directory-skeleton recommendation-skeleton-chip recommendation-skeleton-chip--short" />
              </div>
            </div>
            <span className="directory-skeleton recommendation-skeleton-action" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendationLoadingState
