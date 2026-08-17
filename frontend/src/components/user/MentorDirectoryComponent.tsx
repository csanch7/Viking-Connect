import type { Mentor } from '../../types/user'
import UserDirectoryCard from './UserDirectoryCard'
import RecommendedMentorCard from './RecommendedMentorCard'
import { useAuth } from '../../auth/useAuth'
import { useMentorDirectory } from '../../hooks/useMentorDirectory'
import DirectoryAppliedFilters from './DirectoryAppliedFilters'

function MentorDirectoryComponent() {
  const { mentee: isMentee } = useAuth()
  const directory = useMentorDirectory(isMentee)
  const {
    page,
    searchText,
    expertiseSearchText,
    draftExpertise,
    appliedExpertise,
    draftCollege,
    appliedCollege,
    filterPanelOpen,
    mentors,
    hasNextPage,
    error,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    colleges,
    collegesLoading,
    collegesError,
    topicsLoading,
    topicsError,
    visibleExpertiseOptions,
    activeFilterCount,
    canClearFilters,
    hasActiveFilters,
  } = directory

  function handleFilter(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    directory.applyFilters()
  }

  if (directory.loading) {
    return (
      <section className="directory-empty" aria-live="polite">
        <h2>Loading mentors</h2>
        <p>Gathering approved mentor profiles...</p>
      </section>
    )
  }

  return (
    <>
      {isMentee && (
        <section
          className="recommendations"
          aria-labelledby="recommendations-title"
        >
          <div className="recommendations-header">
            <div>
              <p className="directory-kicker">Based on your profile</p>
              <h2 id="recommendations-title">Recommended for you</h2>
              <p>
                Matched using shared interests and, when available, college.
              </p>
            </div>
          </div>

          {recommendationsLoading ? (
            <p className="recommendations-status" aria-live="polite">
              Finding your strongest mentor matches...
            </p>
          ) : recommendationsError ? (
            <p className="recommendations-status" role="alert">
              {recommendationsError}
            </p>
          ) : recommendations.length > 0 ? (
            <div className="recommendations-grid">
              {recommendations.slice(0, 3).map((recommendation) => (
                <RecommendedMentorCard
                  key={recommendation.mentor.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          ) : (
            <p className="recommendations-status">
              No close matches yet. You can still browse every approved mentor
              below.
            </p>
          )}
        </section>
      )}

      <form className="directory-controls" onSubmit={handleFilter}>
        <div className="directory-filters-header">
          <div>
            <h2>Search mentors</h2>
            <p>Find alumni by name, expertise, or college.</p>
          </div>
        </div>

        <div className="directory-search-row">
          <label className="directory-search" htmlFor="mentor-search">
            <span>Mentor name</span>
            <input
              id="mentor-search"
              type="search"
              value={searchText}
              onChange={(event) => directory.changeSearch(event.target.value)}
              placeholder="Search mentors by name"
            />
          </label>

          <button
            className="directory-filter-toggle"
            type="button"
            aria-expanded={filterPanelOpen}
            aria-controls="directory-filter-panel"
            onClick={directory.toggleFilterPanel}
          >
            Filters
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
        </div>

        {filterPanelOpen && (
          <div className="directory-filter-panel" id="directory-filter-panel">
            <div className="directory-filter-fields">
              <label
                className="directory-filter-search"
                htmlFor="expertise-search"
              >
                <span>Search expertise</span>
                <input
                  id="expertise-search"
                  type="search"
                  value={expertiseSearchText}
                  onChange={(event) =>
                    directory.changeExpertiseSearch(event.target.value)
                  }
                  placeholder="Find an expertise area"
                />
              </label>

              <label
                className="directory-filter-select"
                htmlFor="college-filter"
              >
                <span>College</span>
                <div className="directory-filter-select-shell">
                  <select
                    id="college-filter"
                    value={draftCollege}
                    onChange={(event) =>
                      directory.changeCollege(event.target.value)
                    }
                    disabled={collegesLoading || Boolean(collegesError)}
                  >
                    <option value="">
                      {collegesLoading ? 'Loading colleges...' : 'Any college'}
                    </option>
                    {colleges.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="directory-filter-select-icon"
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path d="m6 8 4 4 4-4" />
                  </svg>
                </div>
              </label>
            </div>

            {collegesError && (
              <div className="directory-filter-recovery">
                <p className="directory-filter-empty" role="alert">
                  {collegesError}
                </p>
                <button type="button" onClick={() => directory.retryColleges()}>
                  Try again
                </button>
              </div>
            )}

            <fieldset className="directory-filter-options">
              <legend className="sr-only">Areas of expertise</legend>
              {topicsLoading ? (
                <p className="directory-filter-empty" aria-live="polite">
                  Loading expertise filters...
                </p>
              ) : topicsError ? (
                <div className="directory-filter-recovery">
                  <p className="directory-filter-empty" role="alert">
                    {topicsError}
                  </p>
                  <button type="button" onClick={() => directory.retryTopics()}>
                    Try again
                  </button>
                </div>
              ) : visibleExpertiseOptions.length > 0 ? (
                visibleExpertiseOptions.map((area) => (
                  <label className="directory-filter-chip" key={area}>
                    <input
                      type="checkbox"
                      name="expertise"
                      value={area}
                      checked={draftExpertise.includes(area)}
                      onChange={(event) =>
                        directory.toggleExpertise(area, event.target.checked)
                      }
                    />
                    <span>{area}</span>
                  </label>
                ))
              ) : (
                <p className="directory-filter-empty">
                  No expertise filters match.
                </p>
              )}
            </fieldset>

            <div className="directory-filter-actions">
              <button className="directory-filter-submit" type="submit">
                Apply filters
              </button>
              <button
                className="directory-filter-clear"
                type="reset"
                onClick={directory.clearFilters}
                disabled={!canClearFilters}
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </form>

      <DirectoryAppliedFilters
        searchText={searchText}
        expertise={appliedExpertise}
        college={appliedCollege}
        topicLabel="Expertise"
        onClear={directory.clearFilters}
      />

      {mentors.length > 0 ? (
        <section className="directory-directory" aria-label="Mentor list">
          <div className="directory-directory-header">
            <div>
              <h2>Mentors</h2>
            </div>
          </div>

          <div className="directory-list">
            {mentors.map((mentor: Mentor) => (
              <UserDirectoryCard key={mentor.id} user={mentor} />
            ))}
          </div>
        </section>
      ) : error ? (
        <section className="directory-empty" aria-live="polite">
          <h2>Unable to load mentors</h2>
          <p>{error}</p>
          <button type="button" onClick={() => directory.retryMentors()}>
            Try loading mentors again
          </button>
        </section>
      ) : (
        <section className="directory-empty" aria-live="polite">
          <h2>{hasActiveFilters ? 'No matching mentors' : 'No mentors yet'}</h2>
          <p>
            {hasActiveFilters
              ? 'Try removing a filter or searching for another name.'
              : 'There are no approved mentors to show yet.'}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={directory.clearFilters}>
              Clear all filters
            </button>
          )}
        </section>
      )}
      <div className="directory-pagination">
        <p>Page {page + 1}</p>
        <div className="directory-pagination-actions">
          {page > 0 && (
            <button onClick={() => directory.changePage(page - 1)}>
              Previous page
            </button>
          )}
          {hasNextPage && (
            <button onClick={() => directory.changePage(page + 1)}>
              Next page
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default MentorDirectoryComponent
