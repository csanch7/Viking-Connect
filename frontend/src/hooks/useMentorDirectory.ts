import { useQuery } from '@tanstack/react-query'
import userService from '../services/userService'
import { useDirectoryFilters } from './useDirectoryFilters'
import {
  useCollegesQuery,
  useDebouncedValue,
  usePaginatedDirectoryQuery,
  useActiveTopicsQuery,
} from './useDirectoryQueries'

export function useMentorDirectory(isMentee: boolean) {
  const filters = useDirectoryFilters('mentor')
  const debouncedSearchText = useDebouncedValue(filters.searchText.trim())
  const mentorsQuery = usePaginatedDirectoryQuery({
    queryKey: [
      'mentors',
      filters.page,
      filters.appliedExpertise,
      debouncedSearchText,
      filters.appliedCollege,
    ],
    queryFn: () =>
      userService.getMentors(
        filters.page,
        filters.appliedExpertise,
        debouncedSearchText,
        filters.appliedCollege,
      ),
    errorMessage: 'We could not load mentors right now. Please try again.',
  })
  const recommendationsQuery = useQuery({
    queryKey: ['mentorRecommendations'],
    queryFn: userService.getMentorRecommendations,
    enabled: isMentee,
  })
  const topicsQuery = useActiveTopicsQuery()
  const collegesQuery = useCollegesQuery()
  const topics = topicsQuery.data ?? []
  const visibleExpertiseOptions = topics.filter((area) =>
    area
      .toLowerCase()
      .includes(filters.expertiseSearchText.trim().toLowerCase()),
  )

  return {
    ...filters,
    mentors: mentorsQuery.results,
    hasNextPage: mentorsQuery.hasNextPage,
    loading: mentorsQuery.loading,
    error: mentorsQuery.error,
    retryMentors: mentorsQuery.retry,
    recommendations: recommendationsQuery.data ?? [],
    recommendationsLoading: isMentee && recommendationsQuery.isPending,
    recommendationsError: recommendationsQuery.isError
      ? 'We could not load your recommendations right now.'
      : '',
    colleges: collegesQuery.data ?? [],
    collegesLoading: collegesQuery.isPending,
    collegesError: collegesQuery.isError ? 'We could not load colleges.' : '',
    retryColleges: collegesQuery.refetch,
    topicsLoading: topicsQuery.isPending,
    topicsError: topicsQuery.isError
      ? 'We could not load expertise filters.'
      : '',
    retryTopics: topicsQuery.refetch,
    visibleExpertiseOptions,
  }
}
