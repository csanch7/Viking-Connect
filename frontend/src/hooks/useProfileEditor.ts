import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import type { PublicUser, UserType } from '../../../shared/contracts'
import userService from '../services/userService'

type ProfileEditorState =
  | { mode: null }
  | {
      mode: 'profile'
      type: UserType
      bio: string
      college: string
      areasOfExpertise: string[]
      selectedArea: string
    }

const closedEditor: ProfileEditorState = { mode: null }

export function useProfileEditor(
  user: PublicUser | null,
  setUser: Dispatch<SetStateAction<PublicUser | null>>,
  onTypeSaved: (type: UserType) => void,
) {
  const [editor, setEditor] = useState<ProfileEditorState>(closedEditor)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const expertiseUnchanged =
    editor.mode !== 'profile' ||
    (user !== null &&
      user.areasOfExpertise.length === editor.areasOfExpertise.length &&
      user.areasOfExpertise.every((area) =>
        editor.areasOfExpertise.includes(area),
      ))
  const isDirty =
    editor.mode === 'profile' &&
    user !== null &&
    (editor.type !== user.type ||
      editor.bio !== user.bio ||
      (editor.college || null) !== user.college ||
      !expertiseUnchanged)
  const bioError =
    editor.mode === 'profile' && !editor.bio.trim()
      ? 'Add a short introduction before saving.'
      : ''
  const expertiseError =
    editor.mode === 'profile' && editor.areasOfExpertise.length === 0
      ? editor.type === 'mentor'
        ? 'Choose at least one area where you can help.'
        : 'Choose at least one area where you would like support.'
      : ''
  const canSave = isDirty && !bioError && !expertiseError && !isSaving

  function getSaveError(error: unknown) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data.message ?? 'We could not save your changes.'
    }
    return 'We could not save your changes.'
  }

  function startEditing() {
    if (!user) return

    setSaveError('')
    setSaveSuccess('')
    setEditor({
      mode: 'profile',
      type: user.type,
      bio: user.bio,
      college: user.college ?? '',
      areasOfExpertise: user.areasOfExpertise,
      selectedArea: '',
    })
  }

  function cancelEditing() {
    setEditor(closedEditor)
    setSaveError('')
  }

  function updateBio(bio: string) {
    setEditor((current) =>
      current.mode === 'profile' ? { ...current, bio } : current,
    )
  }

  function updateType(type: UserType) {
    setEditor((current) =>
      current.mode === 'profile' ? { ...current, type } : current,
    )
  }

  function updateCollege(college: string) {
    setEditor((current) =>
      current.mode === 'profile' ? { ...current, college } : current,
    )
  }

  function updateSelectedExpertise(selectedArea: string) {
    setEditor((current) =>
      current.mode === 'profile' ? { ...current, selectedArea } : current,
    )
  }

  function removeExpertise(area: string) {
    setEditor((current) =>
      current.mode === 'profile'
        ? {
            ...current,
            areasOfExpertise: current.areasOfExpertise.filter(
              (item) => item !== area,
            ),
          }
        : current,
    )
  }

  function addExpertise() {
    setEditor((current) => {
      if (
        current.mode !== 'profile' ||
        !current.selectedArea ||
        current.areasOfExpertise.includes(current.selectedArea)
      ) {
        return current
      }

      return {
        ...current,
        areasOfExpertise: [...current.areasOfExpertise, current.selectedArea],
        selectedArea: '',
      }
    })
  }

  async function saveProfile() {
    if (!user || editor.mode !== 'profile') return

    const type = editor.type
    const bio = editor.bio.trim()
    const college = editor.college || null
    const areasOfExpertise = editor.areasOfExpertise

    if (!bio) {
      setSaveError('Bio cannot be empty.')
      return
    }

    if (areasOfExpertise.length === 0) {
      setSaveError(
        type === 'mentor'
          ? 'Choose at least one area of expertise.'
          : 'Choose at least one area of interest.',
      )
      return
    }

    if (
      type === user.type &&
      bio === user.bio.trim() &&
      college === user.college &&
      expertiseUnchanged
    ) {
      cancelEditing()
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const response = await userService.updateProfile(
        { type, bio, college, areasOfExpertise },
        user.id,
      )
      setUser({
        ...user,
        type: response.type,
        bio: response.bio,
        college: response.college,
        areasOfExpertise: response.areasOfExpertise,
      })
      onTypeSaved(response.type)
      setEditor(closedEditor)
      setSaveError('')
      setSaveSuccess(
        `Your profile is updated. You are now participating as a ${response.type}.`,
      )
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    editor,
    saveError,
    saveSuccess,
    isSaving,
    isDirty,
    bioError,
    expertiseError,
    canSave,
    startEditing,
    cancelEditing,
    updateType,
    updateBio,
    updateCollege,
    updateSelectedExpertise,
    removeExpertise,
    addExpertise,
    saveProfile,
  }
}
