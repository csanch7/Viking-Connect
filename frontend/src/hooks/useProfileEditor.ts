import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import type { PublicUser } from '../../../shared/contracts'
import userService from '../services/userService'

export function useProfileEditor(
  user: PublicUser | null,
  setUser: Dispatch<SetStateAction<PublicUser | null>>,
) {
  const [saveError, setSaveError] = useState('')
  const [editMode, setEditMode] = useState<'bio' | 'expertise' | null>(null)
  const [editBio, setEditBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editAreasOfExpertise, setEditAreasOfExpertise] = useState<string[]>([])
  const [editExpertise, setEditExpertise] = useState('')

  function getSaveError(error: unknown) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data.message ?? 'We could not save your changes.'
    }
    return 'We could not save your changes.'
  }

  function cancelEditing() {
    setEditMode(null)
    setEditBio('')
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
  }

  function startEditingBio() {
    if (!user) return
    setEditBio(user.bio)
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
    setEditMode('bio')
  }

  function startEditingAreasOfExpertise() {
    if (!user) return
    setEditAreasOfExpertise(user.areasOfExpertise)
    setEditBio('')
    setEditExpertise('')
    setSaveError('')
    setEditMode('expertise')
  }

  function removeExpertise(area: string) {
    setEditAreasOfExpertise((list) => list.filter((item) => item !== area))
  }

  function addExpertise() {
    if (!editExpertise || editAreasOfExpertise.includes(editExpertise)) return
    setEditAreasOfExpertise((list) => [...list, editExpertise])
    setEditExpertise('')
  }

  async function saveAreasOfExpertise() {
    if (!user) return
    if (editAreasOfExpertise.length === 0) {
      setSaveError(
        user.type === 'mentor'
          ? 'Choose at least one area of expertise.'
          : 'Choose at least one area of interest.',
      )
      return
    }

    const unchanged =
      user.areasOfExpertise.length === editAreasOfExpertise.length &&
      user.areasOfExpertise.every((area) => editAreasOfExpertise.includes(area))
    if (unchanged) {
      cancelEditing()
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const response = await userService.updateAreasOfExpertise(
        editAreasOfExpertise,
        user.id,
      )
      setUser({ ...user, areasOfExpertise: response.areasOfExpertise })
      cancelEditing()
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function saveBio() {
    if (!user) return
    const normalizedBio = editBio.trim()
    if (!normalizedBio) {
      setSaveError('Bio cannot be empty.')
      return
    }
    if (normalizedBio === user.bio.trim()) {
      cancelEditing()
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const response = await userService.updateBio(normalizedBio, user.id)
      setUser({ ...user, bio: response.bio })
      cancelEditing()
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveError,
    editMode,
    editBio,
    setEditBio,
    isSaving,
    editAreasOfExpertise,
    editExpertise,
    setEditExpertise,
    cancelEditing,
    startEditingBio,
    startEditingAreasOfExpertise,
    removeExpertise,
    addExpertise,
    saveAreasOfExpertise,
    saveBio,
  }
}
