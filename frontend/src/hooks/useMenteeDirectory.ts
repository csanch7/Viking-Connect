import { useQuery } from '@tanstack/react-query'
import userService from '../services/userService'
import { useDirectoryFilters } from './useDirectoryFilters'
import {
  usePaginatedDirectoryQuery,
  useActiveTopicsQuery,
} from './useDirectoryQueries'
import { useDebouncedValue } from './useDebouncedValue'

export function useMenteeDirectory(isMentor: boolean) {
  const filters = useDirectoryFilters()
  const debouncedSearchText = useDebouncedValue(filters.searchText.trim())
  const menteesQuery = usePaginatedDirectoryQuery({
    queryKey: [
      'mentees',
      filters.page,
      filters.appliedExpertise,
      debouncedSearchText,
      filters.appliedCollege,
    ],
    queryFn: () =>
      userService.getMentees(
        filters.page,
        filters.appliedExpertise,
        debouncedSearchText,
        filters.appliedCollege,
      ),
    errorMessage: 'We could not load mentees right now. Please try again.',
  })
  const topicsQuery = useActiveTopicsQuery()
  const recommendationsQuery = useQuery({
    queryKey: ['menteeRecommendations'],
    queryFn: userService.getMenteeRecommendations,
    enabled: isMentor,
  })
  const topics = topicsQuery.data ?? []
  const visibleExpertiseOptions = topics.filter((area) =>
    area
      .toLowerCase()
      .includes(filters.expertiseSearchText.trim().toLowerCase()),
  )

  return {
    ...filters,
    mentees: menteesQuery.results,
    hasNextPage: menteesQuery.hasNextPage,
    loading: menteesQuery.loading,
    retryMentees: menteesQuery.retry,
    error: menteesQuery.error,
    recommendations: recommendationsQuery.data ?? [],
    recommendationsLoading: isMentor && recommendationsQuery.isPending,
    recommendationsError: recommendationsQuery.isError
      ? 'We could not load your recommendations right now.'
      : '',
    retryRecommendations: recommendationsQuery.refetch,
    topicsLoading: topicsQuery.isPending,
    topicsError: topicsQuery.isError
      ? 'We could not load interest filters.'
      : '',
    retryTopics: topicsQuery.refetch,
    visibleExpertiseOptions,
  }
}
