import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import LoadingPage from '../components/LoadingPage'
import ExpertiseChips from '../components/expertise/ExpertiseChips'
import ExpertiseSelector from '../components/expertise/ExpertiseSelector'
import type { PublicUser } from '../../../shared/contracts'
import { useAuth } from '../auth/useAuth'
import { useProfileEditor } from '../hooks/useProfileEditor'
import MemberProfileCardHeading from '../components/profile/MemberProfileCardHeading'
import MemberProfileContact from '../components/profile/MemberProfileContact'
import MemberProfileHero from '../components/profile/MemberProfileHero'
import MemberProfileSummary from '../components/profile/MemberProfileSummary'
import CollegeSelector from '../components/profile/CollegeSelector'

function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { markSignedOut } = useAuth()
  const editor = useProfileEditor(user, setUser)
  const {
    editor: editorState,
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
  } = editor
  const isEditing = editorState.mode === 'profile'

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

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await userService.logout()
      markSignedOut()
      navigate('/login', { replace: true })
    } catch {
      setError('We could not sign you out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  function renderBioContent() {
    if (!user) {
      return null
    }

    if (editorState.mode === 'profile') {
      return (
        <div className="profile-help-form">
          <label htmlFor="editBio">Bio</label>
          <textarea
            id="editBio"
            value={editorState.bio}
            onChange={(event) => updateBio(event.target.value)}
            rows={5}
            required
          />
        </div>
      )
    }

    return (
      <div className="profile-help-summary">
        <p className="member-profile-body">
          {user.bio || 'You have not added a bio yet.'}
        </p>
      </div>
    )
  }

  function renderExpertiseContent() {
    if (!user) {
      return null
    }

    if (editorState.mode === 'profile') {
      return (
        <div className="profile-help-form">
          <ExpertiseSelector
            selectId="editExpertise"
            selectedAreas={editorState.areasOfExpertise}
            selectedArea={editorState.selectedArea}
            onSelectedAreaChange={updateSelectedExpertise}
            onAddArea={addExpertise}
            onRemoveArea={removeExpertise}
          />
        </div>
      )
    }

    return user.areasOfExpertise.length > 0 ? (
      <ExpertiseChips
        areas={user.areasOfExpertise}
        className="member-profile-chips"
      />
    ) : (
      <p className="member-profile-muted">
        No areas of {user.type === 'mentor' ? 'expertise' : 'interest'} added
        yet.
      </p>
    )
  }

  function renderCollegeEditor() {
    if (editorState.mode !== 'profile') {
      return undefined
    }

    return (
      <div className="profile-help-form">
        <CollegeSelector
          selectId="editCollege"
          value={editorState.college}
          onChange={updateCollege}
        />
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

  return (
    <main className="member-profile-page">
      <MemberProfileHero
        user={user}
        action={
          isEditing ? (
            <>
              <button
                className="member-profile-secondary-action"
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="member-profile-primary-action"
                type="submit"
                form="profile-edit-form"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </>
          ) : (
            <>
              <button
                className="member-profile-primary-action"
                type="button"
                onClick={startEditing}
              >
                Edit profile
              </button>
              <button
                className="member-profile-secondary-action"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </>
          )
        }
      />

      <form
        id="profile-edit-form"
        className="member-profile-edit-form"
        onSubmit={(event) => {
          event.preventDefault()
          void saveProfile()
        }}
      >
        {saveError && (
          <p className="profile-inline-error profile-edit-error" role="alert">
            {saveError}
          </p>
        )}
        <div className="member-profile-layout">
          <div className="member-profile-main-column">
            <section className="member-profile-card member-profile-card--accent">
              <MemberProfileCardHeading kicker="Profile" title="About me" />

              {renderBioContent()}
            </section>

            <section className="member-profile-card">
              <MemberProfileCardHeading
                kicker="Mentorship"
                title={`Areas of ${
                  user.type === 'mentor' ? 'expertise' : 'interest'
                }`}
              />

              {renderExpertiseContent()}
            </section>

            <MemberProfileContact user={user} />
          </div>

          <MemberProfileSummary
            user={user}
            collegeEditor={renderCollegeEditor()}
          />
        </div>
      </form>
    </main>
  )
}

export default ProfilePage
