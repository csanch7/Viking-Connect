import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type DirectoryFilterScope = 'mentor' | 'mentee'

function readPage(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return 0

  const page = Number(value)
  return Number.isSafeInteger(page) ? page : 0
}

export function useDirectoryFilters(scope: DirectoryFilterScope) {
  const [searchParams, setSearchParams] = useSearchParams()
  const parameterNames = {
    search: `${scope}Search`,
    expertise: `${scope}Topic`,
    college: `${scope}College`,
    page: `${scope}Page`,
  }

  const page = readPage(searchParams.get(parameterNames.page))
  const searchText = searchParams.get(parameterNames.search) ?? ''
  const appliedExpertise = searchParams.getAll(parameterNames.expertise)
  const appliedCollege = searchParams.get(parameterNames.college) ?? ''
  const appliedExpertiseKey = appliedExpertise.join('\u001f')
  const appliedFilterKey = `${appliedCollege}\u001e${appliedExpertiseKey}`

  const [expertiseSearchText, setExpertiseSearchText] = useState('')
  const [draftFilters, setDraftFilters] = useState(() => ({
    sourceKey: appliedFilterKey,
    expertise: appliedExpertise,
    college: appliedCollege,
  }))
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const draftExpertise =
    draftFilters.sourceKey === appliedFilterKey
      ? draftFilters.expertise
      : appliedExpertise
  const draftCollege =
    draftFilters.sourceKey === appliedFilterKey
      ? draftFilters.college
      : appliedCollege

  function updateSearchParams(
    update: (nextParams: URLSearchParams) => void,
    replace = true,
  ) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        update(nextParams)
        return nextParams
      },
      { replace },
    )
  }

  function changeSearch(value: string) {
    updateSearchParams((nextParams) => {
      if (value) {
        nextParams.set(parameterNames.search, value)
      } else {
        nextParams.delete(parameterNames.search)
      }
      nextParams.delete(parameterNames.page)
    })
  }

  function changePage(nextPage: number) {
    updateSearchParams((nextParams) => {
      if (nextPage > 0) {
        nextParams.set(parameterNames.page, String(nextPage))
      } else {
        nextParams.delete(parameterNames.page)
      }
    }, false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  function applyFilters() {
    updateSearchParams((nextParams) => {
      nextParams.delete(parameterNames.expertise)
      draftExpertise.forEach((area) =>
        nextParams.append(parameterNames.expertise, area),
      )

      if (draftCollege) {
        nextParams.set(parameterNames.college, draftCollege)
      } else {
        nextParams.delete(parameterNames.college)
      }

      nextParams.delete(parameterNames.page)
    }, false)
    setFilterPanelOpen(false)
  }

  function clearFilters() {
    updateSearchParams((nextParams) => {
      Object.values(parameterNames).forEach((parameterName) =>
        nextParams.delete(parameterName),
      )
    }, false)
    setDraftFilters({
      sourceKey: appliedFilterKey,
      expertise: [],
      college: '',
    })
    setExpertiseSearchText('')
  }

  function toggleExpertise(area: string, checked: boolean) {
    setDraftFilters({
      sourceKey: appliedFilterKey,
      expertise: checked
        ? Array.from(new Set([...draftExpertise, area]))
        : draftExpertise.filter((item) => item !== area),
      college: draftCollege,
    })
  }

  function changeCollege(college: string) {
    setDraftFilters({
      sourceKey: appliedFilterKey,
      expertise: draftExpertise,
      college,
    })
  }

  const hasPendingFilterChanges =
    draftCollege !== appliedCollege ||
    draftExpertise.length !== appliedExpertise.length ||
    draftExpertise.some((area) => !appliedExpertise.includes(area))

  return {
    page,
    searchText,
    expertiseSearchText,
    appliedExpertise,
    draftExpertise,
    appliedCollege,
    draftCollege,
    filterPanelOpen,
    activeFilterCount: appliedExpertise.length + (appliedCollege ? 1 : 0),
    hasActiveFilters:
      searchText.trim().length > 0 ||
      appliedExpertise.length > 0 ||
      appliedCollege.length > 0,
    hasPendingFilterChanges,
    canClearFilters:
      draftExpertise.length > 0 ||
      appliedExpertise.length > 0 ||
      draftCollege.length > 0 ||
      appliedCollege.length > 0 ||
      searchText.length > 0 ||
      expertiseSearchText.length > 0,
    applyFilters,
    clearFilters,
    toggleFilterPanel: () => setFilterPanelOpen((isOpen) => !isOpen),
    changeSearch,
    changeExpertiseSearch: setExpertiseSearchText,
    toggleExpertise,
    changeCollege,
    changePage,
  }
}
