import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query'
import topicService from '../services/topicService'

const pageSize = 10
export const activeTopicsQueryKey = ['topics', 'active'] as const
export const topicsQueryKey = ['topics', 'all'] as const

export function usePaginatedDirectoryQuery<T>({
  queryKey,
  queryFn,
  errorMessage,
}: {
  queryKey: QueryKey
  queryFn: () => Promise<T[]>
  errorMessage: string
}) {
  const query = useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
  })
  const results = query.data ?? []

  return {
    queryKey,
    results: results.slice(0, pageSize),
    hasNextPage: results.length > pageSize,
    loading: query.isPending,
    error: query.isError ? errorMessage : '',
    retry: query.refetch,
  }
}

export function useActiveTopicsQuery() {
  return useQuery({
    queryKey: activeTopicsQueryKey,
    queryFn: topicService.getActiveTopics,
  })
}

export function useTopicsQuery() {
  return useQuery({
    queryKey: topicsQueryKey,
    queryFn: topicService.getTopics,
  })
}
