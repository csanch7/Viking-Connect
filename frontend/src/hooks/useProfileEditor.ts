import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import type { PublicUser } from '../../../shared/contracts'
import userService from '../services/userService'

type ProfileEditorState =
  | { mode: null }
  | {
      mode: 'profile'
      bio: string
      college: string
      areasOfExpertise: string[]
      selectedArea: string
    }

const closedEditor: ProfileEditorState = { mode: null }

export function useProfileEditor(
  user: PublicUser | null,
  setUser: Dispatch<SetStateAction<PublicUser | null>>,
) {
  const [editor, setEditor] = useState<ProfileEditorState>(closedEditor)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function getSaveError(error: unknown) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data.message ?? 'We could not save your changes.'
    }
    return 'We could not save your changes.'
  }

  function startEditing() {
    if (!user) return

    setSaveError('')
    setEditor({
      mode: 'profile',
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

    const bio = editor.bio.trim()
    const college = editor.college || null
    const areasOfExpertise = editor.areasOfExpertise

    if (!bio) {
      setSaveError('Bio cannot be empty.')
      return
    }

    if (areasOfExpertise.length === 0) {
      setSaveError(
        user.type === 'mentor'
          ? 'Choose at least one area of expertise.'
          : 'Choose at least one area of interest.',
      )
      return
    }

    const expertiseUnchanged =
      user.areasOfExpertise.length === areasOfExpertise.length &&
      user.areasOfExpertise.every((area) => areasOfExpertise.includes(area))
    if (
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
        { bio, college, areasOfExpertise },
        user.id,
      )
      setUser({
        ...user,
        bio: response.bio,
        college: response.college,
        areasOfExpertise: response.areasOfExpertise,
      })
      cancelEditing()
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    editor,
    saveError,
    isSaving,
    startEditing,
    cancelEditing,
    updateBio,
    updateCollege,
    updateSelectedExpertise,
    removeExpertise,
    addExpertise,
    saveProfile,
  }
}
