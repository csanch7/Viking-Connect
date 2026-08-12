import { useEffect, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from '@tanstack/react-query'
import collegeService from '../services/collegeService'
import topicService from '../services/topicService'

const pageSize = 10
export const topicsQueryKey = ['topics'] as const

export function useDebouncedValue(value: string, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

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

export function useTopicsQuery() {
  return useQuery({
    queryKey: topicsQueryKey,
    queryFn: topicService.getTopics,
  })
}

export function useCollegesQuery() {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: collegeService.getColleges,
  })
}
