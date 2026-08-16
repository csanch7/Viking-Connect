import userService from '../services/userService'
import { useDirectoryFilters } from './useDirectoryFilters'
import {
  useCollegesQuery,
  useDebouncedValue,
  usePaginatedDirectoryQuery,
  useActiveTopicsQuery,
} from './useDirectoryQueries'

export function useMenteeDirectory() {
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
  const collegesQuery = useCollegesQuery()
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
    colleges: collegesQuery.data ?? [],
    collegesLoading: collegesQuery.isPending,
    collegesError: collegesQuery.isError ? 'We could not load colleges.' : '',
    retryColleges: collegesQuery.refetch,
    error: menteesQuery.error,
    topicsLoading: topicsQuery.isPending,
    topicsError: topicsQuery.isError
      ? 'We could not load interest filters.'
      : '',
    retryTopics: topicsQuery.refetch,
    visibleExpertiseOptions,
  }
}
