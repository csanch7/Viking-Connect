import type { Mentor } from '../../types/user'
import { Link } from 'react-router-dom'
import UserDirectoryCard from './UserDirectoryCard'
import RecommendedMentorCard from './RecommendedMentorCard'
import { useAuth } from '../../auth/useAuth'
import { useMentorDirectory } from '../../hooks/useMentorDirectory'
import DirectoryAppliedFilters from './DirectoryAppliedFilters'
import DirectoryLoadingState from './DirectoryLoadingState'
import RecommendationLoadingState from './RecommendationLoadingState'
import CollegeSelector from '../CollegeSelector'

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
    topicsLoading,
    topicsError,
    visibleExpertiseOptions,
    activeFilterCount,
    canClearFilters,
    hasActiveFilters,
  } = directory
  const visibleRecommendations = recommendations.slice(0, 3)

  function handleFilter(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    directory.applyFilters()
  }

  if (directory.loading) {
    return <DirectoryLoadingState memberType="mentors" />
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
              <h2 id="recommendations-title">Recommended for you</h2>
              <p>
                Your top mentor matches, based on interests in your profile and
                your college when available.
              </p>
            </div>
          </div>

          {recommendationsLoading ? (
            <RecommendationLoadingState />
          ) : recommendationsError ? (
            <div className="recommendations-state" role="alert">
              <div>
                <strong>Recommendations are temporarily unavailable</strong>
                <p>
                  {recommendationsError} You can still browse every approved
                  mentor below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void directory.retryRecommendations()}
              >
                Try recommendations again
              </button>
            </div>
          ) : visibleRecommendations.length > 0 ? (
            <div className="recommendations-grid">
              {visibleRecommendations.map((recommendation) => (
                <RecommendedMentorCard
                  key={recommendation.mentor.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          ) : (
            <div className="recommendations-state">
              <div>
                <strong>No close matches yet</strong>
                <p>
                  Add current interests or college information to your profile,
                  or browse every approved mentor below.
                </p>
              </div>
              <Link to="/profile">Review your profile</Link>
            </div>
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

              <CollegeSelector
                className="directory-college-filter"
                selectId="college-filter"
                value={draftCollege}
                onChange={directory.changeCollege}
                emptyLabel="Any college"
                supportingText=""
              />
            </div>

            <fieldset className="directory-filter-options">
              <legend className="sr-only">
                Areas of Expertise / Industries
              </legend>
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
        showClearAction={mentors.length > 0 || Boolean(error)}
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
        <section
          className="directory-empty directory-empty--compact"
          aria-live="polite"
        >
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
      {(mentors.length > 0 || page > 0) && (
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
      )}
    </>
  )
}

export default MentorDirectoryComponent
