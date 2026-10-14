import { Link } from 'react-router-dom'
import type { Mentee } from '../../types/user'
import UserDirectoryCard from './UserDirectoryCard'
import { useMenteeDirectory } from '../../hooks/useMenteeDirectory'
import DirectoryAppliedFilters from './DirectoryAppliedFilters'
import DirectoryLoadingState from './DirectoryLoadingState'
import CollegeSelector from '../CollegeSelector'
import RecommendedMenteeCard from './RecommendedMenteeCard'
import RecommendationLoadingState from './RecommendationLoadingState'
import { useAuth } from '../../auth/useAuth'
import RecommendationFeedback from './RecommendationFeedback'
import { useRecommendationActions } from '../../hooks/useRecommendationActions'

function MenteeDirectoryComponent() {
  const { mentee: isMentee, admin } = useAuth()
  const isMentor = !isMentee && !admin
  const directory = useMenteeDirectory(isMentor)
  const recommendationActions = useRecommendationActions(
    'menteeRecommendations',
  )
  const {
    page,
    searchText,
    expertiseSearchText,
    draftExpertise,
    appliedExpertise,
    mentees,
    hasNextPage,
    error,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    topicsLoading,
    topicsError,
    visibleExpertiseOptions,
    canClearFilters,
    draftCollege,
    appliedCollege,
    hasActiveFilters,
    hasPendingFilterChanges,
  } = directory
  const visibleRecommendations = recommendations.slice(0, 3)

  function handleFilter(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    directory.applyFilters()
  }

  if (directory.loading) {
    return <DirectoryLoadingState memberType="mentees" />
  }

  return (
    <>
      {isMentor && (
        <section
          className="recommendations"
          aria-labelledby="mentee-recommendations-title"
        >
          <div className="recommendations-header">
            <div>
              <h2 id="mentee-recommendations-title">Recommended for you</h2>
              <p>
                Mentees whose interests align with your experience and, when
                available, your college connection.
              </p>
            </div>
          </div>

          <RecommendationFeedback
            notice={recommendationActions.notice}
            error={recommendationActions.error}
            undoing={Boolean(recommendationActions.pendingMemberId)}
            onUndo={() => void recommendationActions.undo()}
          />

          {recommendationsLoading ? (
            <RecommendationLoadingState memberType="mentee" />
          ) : recommendationsError ? (
            <div className="recommendations-state" role="alert">
              <div>
                <strong>Recommendations are temporarily unavailable</strong>
                <p>
                  {recommendationsError} You can still browse every approved
                  mentee below.
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
                <RecommendedMenteeCard
                  key={recommendation.mentee.id}
                  recommendation={recommendation}
                  pending={
                    recommendationActions.pendingMemberId ===
                    recommendation.mentee.id
                  }
                  onAction={(memberId, memberName, action) =>
                    void recommendationActions.setAction(
                      memberId,
                      memberName,
                      action,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="recommendations-state">
              <div>
                <strong>No new matches right now</strong>
                <p>
                  Check back as new members join or profiles change. You can
                  review people you contacted or hid on your profile.
                </p>
              </div>
              <Link to="/profile#contact-history">View match history</Link>
            </div>
          )}
        </section>
      )}

      <form className="directory-controls" onSubmit={handleFilter}>
        <div className="directory-filters-header">
          <div>
            <h2>Search mentees</h2>
            <p>Find students by name, area of interest, or college.</p>
          </div>
        </div>

        <div className="directory-search-row">
          <label className="directory-search" htmlFor="mentee-search">
            <span>Mentee name</span>
            <input
              id="mentee-search"
              type="search"
              value={searchText}
              onChange={(event) => directory.changeSearch(event.target.value)}
              placeholder="Search by name"
            />
          </label>
        </div>

        <div className="directory-filter-panel" id="directory-filter-panel">
          <div className="directory-filter-fields">
            <label
              className="directory-filter-search"
              htmlFor="interest-search"
            >
              <span>Search interests</span>
              <input
                id="interest-search"
                type="search"
                value={expertiseSearchText}
                onChange={(event) =>
                  directory.changeExpertiseSearch(event.target.value)
                }
                placeholder="Find a filter"
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
            <legend className="sr-only">Areas of interest</legend>
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
                No interest filters match.
              </p>
            )}
          </fieldset>

          <div className="directory-filter-actions">
            {hasPendingFilterChanges && (
              <p className="directory-filter-pending" role="status">
                Your filter changes are ready to apply.
              </p>
            )}
            <button className="directory-filter-submit" type="submit">
              Apply filters
            </button>
            <button
              className="directory-filter-clear"
              type="reset"
              onClick={directory.clearFilters}
              disabled={!canClearFilters}
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <DirectoryAppliedFilters
        searchText={searchText}
        expertise={appliedExpertise}
        college={appliedCollege}
        topicLabel="Interest"
        onClear={directory.clearFilters}
        showClearAction={mentees.length > 0 || Boolean(error)}
      />

      {mentees.length > 0 ? (
        <section className="directory-directory" aria-label="Mentee list">
          <div className="directory-directory-header">
            <div>
              <h2>Mentees</h2>
            </div>
          </div>

          <div className="directory-list">
            {mentees.map((mentee: Mentee) => (
              <UserDirectoryCard key={mentee.id} user={mentee} />
            ))}
          </div>
        </section>
      ) : error ? (
        <section
          className="directory-empty directory-empty--compact"
          aria-live="polite"
        >
          <h2>Unable to load mentees</h2>
          <p>{error}</p>
          <button type="button" onClick={() => directory.retryMentees()}>
            Try loading mentees again
          </button>
        </section>
      ) : (
        <section className="directory-empty" aria-live="polite">
          <h2>{hasActiveFilters ? 'No matching mentees' : 'No mentees yet'}</h2>
          <p>
            {hasActiveFilters
              ? 'Try removing a filter or searching for another name.'
              : 'There are no other approved mentees to show yet.'}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={directory.clearFilters}>
              Clear all filters
            </button>
          )}
        </section>
      )}
      {(mentees.length > 0 || page > 0) && (
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

export default MenteeDirectoryComponent
