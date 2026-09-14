import { useQuery } from '@tanstack/react-query'
import collegeService from '../services/collegeService'

export function useCollegesQuery(searchText = '') {
  return useQuery({
    queryKey: ['colleges', searchText],
    queryFn: ({ signal }) =>
      collegeService.getColleges(searchText || undefined, signal),
    staleTime: 5 * 60 * 1000,
  })
}
