import { useReducer } from 'react'

export type DirectoryFilterState = {
  page: number
  searchText: string
  expertiseSearchText: string
  appliedExpertise: string[]
  draftExpertise: string[]
  appliedCollege: string
  draftCollege: string
}

type DirectoryFilterAction =
  | { type: 'searchChanged'; value: string }
  | { type: 'expertiseSearchChanged'; value: string }
  | { type: 'expertiseToggled'; area: string; checked: boolean }
  | { type: 'collegeChanged'; value: string }
  | { type: 'filtersApplied' }
  | { type: 'filtersCleared' }
  | { type: 'pageChanged'; page: number }

const initialDirectoryFilterState: DirectoryFilterState = {
  page: 0,
  searchText: '',
  expertiseSearchText: '',
  appliedExpertise: [],
  draftExpertise: [],
  appliedCollege: '',
  draftCollege: '',
}

function directoryFilterReducer(
  state: DirectoryFilterState,
  action: DirectoryFilterAction,
): DirectoryFilterState {
  switch (action.type) {
    case 'searchChanged':
      return { ...state, searchText: action.value, page: 0 }
    case 'expertiseSearchChanged':
      return { ...state, expertiseSearchText: action.value }
    case 'expertiseToggled':
      return {
        ...state,
        draftExpertise: action.checked
          ? Array.from(new Set([...state.draftExpertise, action.area]))
          : state.draftExpertise.filter((area) => area !== action.area),
      }
    case 'collegeChanged':
      return { ...state, draftCollege: action.value }
    case 'filtersApplied':
      return {
        ...state,
        appliedExpertise: state.draftExpertise,
        appliedCollege: state.draftCollege,
        page: 0,
      }
    case 'filtersCleared':
      return initialDirectoryFilterState
    case 'pageChanged':
      return { ...state, page: action.page }
  }
}

export function useDirectoryFilters() {
  const [state, dispatch] = useReducer(
    directoryFilterReducer,
    initialDirectoryFilterState,
  )

  function changePage(page: number) {
    dispatch({ type: 'pageChanged', page })
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  return {
    ...state,
    hasActiveFilters:
      state.searchText.trim().length > 0 ||
      state.appliedExpertise.length > 0 ||
      state.appliedCollege.length > 0,
    hasPendingFilterChanges:
      state.draftCollege !== state.appliedCollege ||
      state.draftExpertise.length !== state.appliedExpertise.length ||
      state.draftExpertise.some(
        (area) => !state.appliedExpertise.includes(area),
      ),
    canClearFilters:
      state.draftExpertise.length > 0 ||
      state.appliedExpertise.length > 0 ||
      state.draftCollege.length > 0 ||
      state.appliedCollege.length > 0 ||
      state.searchText.length > 0 ||
      state.expertiseSearchText.length > 0,
    applyFilters: () => dispatch({ type: 'filtersApplied' }),
    clearFilters: () => dispatch({ type: 'filtersCleared' }),
    changeSearch: (value: string) => dispatch({ type: 'searchChanged', value }),
    changeExpertiseSearch: (value: string) =>
      dispatch({ type: 'expertiseSearchChanged', value }),
    toggleExpertise: (area: string, checked: boolean) =>
      dispatch({ type: 'expertiseToggled', area, checked }),
    changeCollege: (value: string) =>
      dispatch({ type: 'collegeChanged', value }),
    changePage,
  }
}
