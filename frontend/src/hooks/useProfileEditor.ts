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
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')
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
    setEditMode(false)
    setEditText('')
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
  }

  function startEditingHelpText() {
    if (!user) return
    setEditText(user.helpText)
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
    setEditMode(true)
  }

  function startEditingAreasOfExpertise() {
    if (!user) return
    setEditAreasOfExpertise(user.areasOfExpertise)
    setEditText('')
    setEditExpertise('')
    setSaveError('')
    setEditMode(true)
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
      setSaveError('Choose at least one area of expertise.')
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

  async function saveHelpText() {
    if (!user) return
    const normalizedText = editText.trim()
    if (!normalizedText) {
      setSaveError('Help needed cannot be empty.')
      return
    }
    if (normalizedText === user.helpText.trim()) {
      cancelEditing()
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const response = await userService.updateHelpText(normalizedText, user.id)
      setUser({ ...user, helpText: response.helpText })
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
    editText,
    setEditText,
    isSaving,
    editAreasOfExpertise,
    editExpertise,
    setEditExpertise,
    cancelEditing,
    startEditingHelpText,
    startEditingAreasOfExpertise,
    removeExpertise,
    addExpertise,
    saveAreasOfExpertise,
    saveHelpText,
  }
}
