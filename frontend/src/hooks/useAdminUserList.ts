import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import adminService from '../services/adminService'
import { usePaginatedDirectoryQuery } from './useDirectoryQueries'
import { useDebouncedValue } from './useDebouncedValue'

type DirectoryUser = {
  id: string
}

type AdminListState<T extends DirectoryUser> = {
  page: number
  searchText: string
  deleteTarget: T | null
  deleteError: string
  message: string
}

export function useAdminUserList<T extends DirectoryUser>({
  queryName,
  loadUsers,
  loadErrorMessage,
}: {
  queryName: 'mentors' | 'mentees'
  loadUsers: (page: number, searchText: string) => Promise<T[]>
  loadErrorMessage: string
}) {
  const [state, setState] = useState<AdminListState<T>>({
    page: 0,
    searchText: '',
    deleteTarget: null,
    deleteError: '',
    message: '',
  })
  const queryClient = useQueryClient()
  const debouncedSearchText = useDebouncedValue(state.searchText.trim())
  const usersQuery = usePaginatedDirectoryQuery({
    queryKey: [queryName, state.page, [], debouncedSearchText],
    queryFn: () => loadUsers(state.page, debouncedSearchText),
    errorMessage: loadErrorMessage,
  })
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: (response, userId) => {
      queryClient.setQueryData<T[]>(usersQuery.queryKey, (users) =>
        users?.filter((user) => user.id !== userId),
      )
      setState((current) => ({
        ...current,
        deleteTarget: null,
        deleteError: '',
        message: response.message,
      }))
    },
    onError: () => {
      setState((current) => ({
        ...current,
        deleteError: 'We could not delete this user. Please try again.',
      }))
    },
  })

  function changeSearch(searchText: string) {
    setState((current) => ({ ...current, searchText, page: 0 }))
  }

  function changePage(page: number) {
    setState((current) => ({ ...current, page }))
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  function beginDelete(deleteTarget: T) {
    setState((current) => ({
      ...current,
      deleteTarget,
      deleteError: '',
      message: '',
    }))
  }

  function cancelDelete() {
    if (deleteMutation.isPending) return
    setState((current) => ({
      ...current,
      deleteTarget: null,
      deleteError: '',
    }))
  }

  function confirmDelete() {
    if (!state.deleteTarget || deleteMutation.isPending) return
    deleteMutation.mutate(state.deleteTarget.id)
  }

  return {
    ...state,
    users: usersQuery.results,
    hasNextPage: usersQuery.hasNextPage,
    loading: usersQuery.loading,
    loadError: usersQuery.error,
    activeUserId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
    changeSearch,
    changePage,
    beginDelete,
    cancelDelete,
    confirmDelete,
  }
}
