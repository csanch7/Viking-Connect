import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import LoadingPage from '../components/LoadingPage'
import ExpertiseChips from '../components/expertise/ExpertiseChips'
import ExpertiseSelector from '../components/expertise/ExpertiseSelector'
import axios from 'axios'

export interface ProfileUser {
  id: string
  username: string
  email: string
  type: string
  linkedin: string
  helpText: string
  areasOfExpertise: string[]
  gradYear: number
  status: string
  role: 'admin' | 'user'
}

function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [editAreasOfExpertise, setEditAreasOfExpertise] = useState<string[]>([])
  const [editExpertise, setEditExpertise] = useState<string>('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await userService.getMe()
        setUser(response.user)
      } catch {
        setError('We could not load your profile. Please sign in again.')
      }
    }

    void loadUser()
  }, [])

  function getSaveError(error: unknown) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data.message ?? 'We could not save your changes.'
    }

    return 'We could not save your changes.'
  }

  function expertiseIsUnchanged(current: string[], edited: string[]) {
    return (
      current.length === edited.length &&
      current.every((area) => edited.includes(area))
    )
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await userService.logout()
      navigate('/')
    } catch {
      setError('We could not sign you out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  function startEditingHelpText() {
    if (!user) {
      return
    }

    setEditText(user.helpText)
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
    setEditMode(true)
  }

  function startEditingAreasOfExpertise() {
    if (!user) {
      return
    }

    setEditAreasOfExpertise(user.areasOfExpertise)
    setEditText('')
    setEditExpertise('')
    setSaveError('')
    setEditMode(true)
  }

  function cancelEditing() {
    setEditMode(false)
    setEditText('')
    setEditAreasOfExpertise([])
    setEditExpertise('')
    setSaveError('')
  }

  function removeExpertise(area: string) {
    setEditAreasOfExpertise((previousList) =>
      previousList.filter((item) => item !== area),
    )
  }

  function addExpertise() {
    if (!editExpertise || editAreasOfExpertise.includes(editExpertise)) {
      return
    }

    setEditAreasOfExpertise((previousList) => [...previousList, editExpertise])
    setEditExpertise('')
  }

  async function saveAreasOfExpertise() {
    if (!user) {
      return
    }

    if (editAreasOfExpertise.length === 0) {
      setSaveError('Choose at least one area of expertise.')
      return
    }

    if (expertiseIsUnchanged(user.areasOfExpertise, editAreasOfExpertise)) {
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

      setUser({
        ...user,
        areasOfExpertise: response.areasOfExpertise,
      })
      cancelEditing()
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function saveHelpText() {
    if (!user) {
      return
    }

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

      setUser({
        ...user,
        helpText: response.helpText,
      })
      cancelEditing()
    } catch (error) {
      setSaveError(getSaveError(error))
    } finally {
      setIsSaving(false)
    }
  }

  function renderSubmitButton() {
    return (
      <button
        className="profile-primary-button"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    )
  }

  function renderMentorshipContent() {
    if (!user) {
      return null
    }

    if (user.type === 'mentor' && editMode) {
      return (
        <form
          className="profile-help-form"
          onSubmit={(event) => {
            event.preventDefault()
            void saveAreasOfExpertise()
          }}
        >
          {saveError && (
            <p className="profile-inline-error" role="alert">
              {saveError}
            </p>
          )}
          <ExpertiseSelector
            selectId="editExpertise"
            selectedAreas={editAreasOfExpertise}
            selectedArea={editExpertise}
            onSelectedAreaChange={setEditExpertise}
            onAddArea={addExpertise}
            onRemoveArea={removeExpertise}
          />
          <div className="profile-help-actions">
            <button
              className="profile-secondary-button"
              type="button"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            {renderSubmitButton()}
          </div>
        </form>
      )
    }

    if (user.type === 'mentor') {
      return user.areasOfExpertise.length > 0 ? (
        <ExpertiseChips
          areas={user.areasOfExpertise}
          className="profile-chips"
        />
      ) : (
        <p className="profile-empty">No areas of expertise added yet.</p>
      )
    }

    if (editMode) {
      return (
        <form
          className="profile-help-form"
          onSubmit={(event) => {
            event.preventDefault()
            void saveHelpText()
          }}
        >
          {saveError && (
            <p className="profile-inline-error" role="alert">
              {saveError}
            </p>
          )}
          <label htmlFor="editText">Help needed</label>
          <textarea
            id="editText"
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            rows={5}
            required
          />
          <div className="profile-help-actions">
            <button
              className="profile-secondary-button"
              type="button"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            {renderSubmitButton()}
          </div>
        </form>
      )
    }

    return (
      <div className="profile-help-summary">
        <p className="profile-help-text">
          {user.helpText ||
            'You have not added what you would like help with yet.'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <main className="profile-page profile-state">
        <span className="profile-state-icon">!</span>
        <h1>Something went sideways</h1>
        <p>{error}</p>
        <button
          className="profile-primary-button"
          onClick={() => navigate('/')}
        >
          Back to sign in
        </button>
      </main>
    )
  }

  if (!user) {
    return <LoadingPage />
  }

  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'
  const profileInitial = user.username.slice(0, 1).toUpperCase()

  return (
    <main className="profile-page">
      <section className="profile-hero profile-card">
        <div className="profile-cover" aria-hidden="true" />
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            {profileInitial}
          </div>
          <div className="profile-heading">
            <div className="profile-eyebrow">
              {user.role === 'admin' && (
                <span className="profile-role">Admin</span>
              )}
            </div>
            <h1>{user.username}</h1>
            <p>{memberType} in the STL Mentorship Program</p>
          </div>
          <div className="profile-actions">
            <button
              className="profile-logout-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </section>

      <div className="profile-layout">
        <div className="profile-main-column">
          <section className="profile-card profile-card--accent">
            <div className="profile-card-heading profile-card-heading--with-action">
              <div>
                <span className="profile-card-kicker">Mentorship</span>
                <h2>
                  {user.type === 'mentor'
                    ? 'Areas of expertise'
                    : 'What you are looking for'}
                </h2>
              </div>
              {!editMode && (
                <button
                  className="profile-edit-help-button"
                  type="button"
                  onClick={
                    user.type === 'mentor'
                      ? startEditingAreasOfExpertise
                      : startEditingHelpText
                  }
                  aria-label={
                    user.type === 'mentor'
                      ? 'Edit areas of expertise'
                      : 'Edit help text'
                  }
                >
                  Edit
                </button>
              )}
            </div>

            {renderMentorshipContent()}
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <span className="profile-card-kicker">Contact</span>
              <h2>About</h2>
            </div>
            <dl className="profile-details">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  {user.linkedin ? (
                    <a href={user.linkedin} target="_blank" rel="noreferrer">
                      View profile <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="profile-muted">Not added</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="profile-side-column" aria-label="Profile summary">
          <section className="profile-card profile-summary-card">
            <div className="profile-card-heading">
              <span className="profile-card-kicker">Program</span>
              <h2>Snapshot</h2>
            </div>
            <dl className="profile-summary-list">
              <div>
                <dt>Role</dt>
                <dd>{memberType}</dd>
              </div>
              <div>
                <dt>Graduation year</dt>
                <dd>{user.gradYear}</dd>
              </div>
              <div>
                <dt>Member</dt>
                <dd>#{user.id}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default ProfilePage
