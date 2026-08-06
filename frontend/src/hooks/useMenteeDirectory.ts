import userService from '../services/userService'
import { useDirectoryFilters } from './useDirectoryFilters'
import {
  useDebouncedValue,
  usePaginatedDirectoryQuery,
  useTopicsQuery,
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
    ],
    queryFn: () =>
      userService.getMentees(
        filters.page,
        filters.appliedExpertise,
        debouncedSearchText,
      ),
    errorMessage: 'We could not load mentees right now. Please try again.',
  })
  const topicsQuery = useTopicsQuery()
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
    error: menteesQuery.error,
    topicsLoading: topicsQuery.isPending,
    topicsError: topicsQuery.isError
      ? 'We could not load expertise filters. Please refresh and try again.'
      : '',
    visibleExpertiseOptions,
  }
}
