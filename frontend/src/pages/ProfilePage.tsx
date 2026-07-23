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

function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { markSignedOut } = useAuth()
  const editor = useProfileEditor(user, setUser)
  const {
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
  } = editor

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

  function renderBioContent() {
    if (!user) {
      return null
    }

    if (editMode === 'bio') {
      return (
        <form
          className="profile-help-form"
          onSubmit={(event) => {
            event.preventDefault()
            void saveBio()
          }}
        >
          {saveError && (
            <p className="profile-inline-error" role="alert">
              {saveError}
            </p>
          )}
          <label htmlFor="editBio">Bio</label>
          <textarea
            id="editBio"
            value={editBio}
            onChange={(event) => setEditBio(event.target.value)}
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

    if (editMode === 'expertise') {
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
          <button
            className="member-profile-secondary-action"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        }
      />

      <div className="member-profile-layout">
        <div className="member-profile-main-column">
          <section className="member-profile-card member-profile-card--accent">
            <MemberProfileCardHeading
              kicker="Profile"
              title="About me"
              action={
                !editMode ? (
                  <button
                    className="member-profile-edit-button"
                    type="button"
                    onClick={startEditingBio}
                    aria-label="Edit bio"
                  >
                    Edit
                  </button>
                ) : undefined
              }
            />

            {renderBioContent()}
          </section>

          <section className="member-profile-card">
            <MemberProfileCardHeading
              kicker="Mentorship"
              title={`Areas of ${
                user.type === 'mentor' ? 'expertise' : 'interest'
              }`}
              action={
                !editMode ? (
                  <button
                    className="member-profile-edit-button"
                    type="button"
                    onClick={startEditingAreasOfExpertise}
                    aria-label={`Edit areas of ${
                      user.type === 'mentor' ? 'expertise' : 'interest'
                    }`}
                  >
                    Edit
                  </button>
                ) : undefined
              }
            />

            {renderExpertiseContent()}
          </section>

          <MemberProfileContact user={user} />
        </div>

        <MemberProfileSummary user={user} />
      </div>
    </main>
  )
}

export default ProfilePage
