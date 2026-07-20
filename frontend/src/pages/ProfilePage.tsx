import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import LoadingPage from '../components/LoadingPage'
import ExpertiseChips from '../components/expertise/ExpertiseChips'
import ExpertiseSelector from '../components/expertise/ExpertiseSelector'
import type { PublicUser } from '../../../shared/contracts'
import { useAuth } from '../auth/useAuth'
import { useProfileEditor } from '../hooks/useProfileEditor'

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
        <p className="profile-help-text">
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
        className="profile-chips"
      />
    ) : (
      <p className="profile-empty">
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

  const memberType = user.type === 'mentor' ? 'Mentor' : 'Mentee'
  const profileInitial = user.name.slice(0, 1).toUpperCase()

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
            <h1>{user.name}</h1>
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
                <span className="profile-card-kicker">Profile</span>
                <h2>About me</h2>
              </div>
              {!editMode && (
                <button
                  className="profile-edit-help-button"
                  type="button"
                  onClick={startEditingBio}
                  aria-label="Edit bio"
                >
                  Edit
                </button>
              )}
            </div>

            {renderBioContent()}
          </section>

          <section className="profile-card">
            <div className="profile-card-heading profile-card-heading--with-action">
              <div>
                <span className="profile-card-kicker">Mentorship</span>
                <h2>
                  Areas of {user.type === 'mentor' ? 'expertise' : 'interest'}
                </h2>
              </div>
              {!editMode && (
                <button
                  className="profile-edit-help-button"
                  type="button"
                  onClick={startEditingAreasOfExpertise}
                  aria-label={`Edit areas of ${
                    user.type === 'mentor' ? 'expertise' : 'interest'
                  }`}
                >
                  Edit
                </button>
              )}
            </div>

            {renderExpertiseContent()}
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
