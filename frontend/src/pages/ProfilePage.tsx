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
import CollegeSelector from '../components/CollegeSelector'
import ConfirmationDialog from '../components/ConfirmationDialog'
import MatchActionHistory from '../components/profile/MatchActionHistory'

function ProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [error, setError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { markSignedOut, setMentorshipType } = useAuth()
  const editor = useProfileEditor(user, setUser, setMentorshipType)
  const {
    editor: editorState,
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
  } = editor
  const isEditing = editorState.mode === 'profile'

  useEffect(() => {
    if (!isDirty) return

    function preventAccidentalExit(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', preventAccidentalExit)
    return () =>
      window.removeEventListener('beforeunload', preventAccidentalExit)
  }, [isDirty])

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
        {user.type === 'mentor'
          ? 'No areas of expertise / industries added yet.'
          : 'No areas of interest added yet.'}
      </p>
    )
  }

  function requestCancelEditing() {
    if (isDirty) {
      setCancelDialogOpen(true)
      return
    }

    cancelEditing()
  }

  if (error) {
    return (
      <main className="profile-page profile-state">
        <span className="profile-state-icon">!</span>
        <h1>We could not load your profile</h1>
        <p>{error}</p>
        <button
          className="profile-primary-button"
          onClick={() => navigate('/login')}
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
          !isEditing ? (
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
          ) : undefined
        }
      />

      {saveSuccess && !isEditing && (
        <p className="profile-save-success" role="status">
          <span aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="m5.5 10.5 3 3 6-7" />
            </svg>
          </span>
          {saveSuccess}
        </p>
      )}

      {isEditing ? (
        <form
          id="profile-edit-form"
          className="profile-edit-shell"
          onSubmit={(event) => {
            event.preventDefault()
            void saveProfile()
          }}
        >
          {saveError && (
            <p className="profile-inline-error profile-edit-error" role="alert">
              {saveError} Your changes are still here—review the fields and try
              again.
            </p>
          )}

          <div className="profile-edit-layout">
            <section
              className="member-profile-card profile-edit-panel"
              aria-labelledby="profile-edit-title"
            >
              <header className="profile-edit-heading">
                <h2 id="profile-edit-title">Edit your profile</h2>
                <p>
                  Help {editorState.type === 'mentor' ? 'mentees' : 'mentors'}{' '}
                  understand your background and what a useful connection looks
                  like.
                </p>
              </header>

              <fieldset className="profile-role-group">
                <legend>Mentorship role</legend>
                <p className="profile-edit-help">
                  Choose how you want to participate. You can switch again at
                  any time.
                </p>
                <div>
                  <label
                    className="profile-role-option"
                    htmlFor="profile-mentee"
                  >
                    <input
                      id="profile-mentee"
                      name="profile-type"
                      type="radio"
                      value="mentee"
                      checked={editorState.type === 'mentee'}
                      onChange={() => updateType('mentee')}
                    />
                    <span>
                      <strong>Mentee</strong>
                      <small>I am looking for guidance.</small>
                    </span>
                  </label>
                  <label
                    className="profile-role-option"
                    htmlFor="profile-mentor"
                  >
                    <input
                      id="profile-mentor"
                      name="profile-type"
                      type="radio"
                      value="mentor"
                      checked={editorState.type === 'mentor'}
                      onChange={() => updateType('mentor')}
                    />
                    <span>
                      <strong>Mentor</strong>
                      <small>I want to offer guidance.</small>
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className="profile-edit-section">
                <div className="profile-edit-field-heading">
                  <label htmlFor="editBio">About you</label>
                  <span>Required</span>
                </div>
                <p className="profile-edit-help" id="editBio-help">
                  {editorState.type === 'mentor'
                    ? 'Share the experience you bring and how you hope to support other Vikings.'
                    : 'Share what you are working toward and where mentorship could make a difference.'}
                </p>

                <textarea
                  id="editBio"
                  className="profile-edit-textarea"
                  value={editorState.bio}
                  onChange={(event) => updateBio(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  required
                  aria-invalid={Boolean(bioError)}
                  aria-describedby={`editBio-help${bioError ? ' editBio-error' : ''}`}
                />
                <div className="profile-edit-field-footer">
                  {bioError ? (
                    <p id="editBio-error" className="profile-edit-field-error">
                      {bioError}
                    </p>
                  ) : (
                    <span>
                      Write in your own voice; a few sentences is enough.
                    </span>
                  )}
                  <span>{editorState.bio.length}/1000</span>
                </div>
              </div>

              <div className="profile-edit-section">
                <CollegeSelector
                  selectId="editCollege"
                  value={editorState.college}
                  onChange={updateCollege}
                  supportingText="Optional. A shared college can help create a stronger connection."
                />
              </div>

              <div className="profile-edit-section">
                <div className="profile-edit-field-heading">
                  <h3>
                    {editorState.type === 'mentor'
                      ? 'How you can help'
                      : 'What you would like help with'}
                  </h3>
                  <span>Required</span>
                </div>
                <p className="profile-edit-help">
                  These topics help Viking Connect surface more relevant
                  connections.
                </p>
                <ExpertiseSelector
                  selectId="editExpertise"
                  className="profile-topic-selector"
                  selectedAreas={editorState.areasOfExpertise}
                  selectedArea={editorState.selectedArea}
                  onSelectedAreaChange={updateSelectedExpertise}
                  onAddArea={addExpertise}
                  onRemoveArea={removeExpertise}
                  label={
                    editorState.type === 'mentor'
                      ? 'Add an expertise area'
                      : 'Add an interest'
                  }
                />
                {expertiseError && (
                  <p className="profile-edit-field-error" role="alert">
                    {expertiseError}
                  </p>
                )}
              </div>
            </section>

            <aside
              className="profile-edit-preview"
              aria-labelledby="profile-preview-title"
            >
              <section className="member-profile-card">
                <h2 id="profile-preview-title">Profile preview</h2>
                <p className="profile-edit-preview-copy">
                  This is the context members use when deciding to connect.
                </p>
                <div className="profile-edit-preview-person">
                  <div aria-hidden="true">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span>
                    <strong>{user.name}</strong>
                    <small>
                      {editorState.type === 'mentor' ? 'Mentor' : 'Mentee'} ·{' '}
                      {user.gradYear
                        ? `Class of ${user.gradYear}`
                        : 'Community member'}
                    </small>
                  </span>
                </div>
                <dl className="profile-edit-preview-list">
                  <div>
                    <dt>College</dt>
                    <dd>{editorState.college || 'Not listed'}</dd>
                  </div>
                  <div>
                    <dt>
                      {editorState.type === 'mentor'
                        ? 'Expertise areas'
                        : 'Interests'}
                    </dt>
                    <dd>{editorState.areasOfExpertise.length}</dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>

          <div className="profile-edit-action-bar">
            <p role="status">
              <strong>{isDirty ? 'Unsaved changes' : 'No changes yet'}</strong>
              <span>
                {isDirty
                  ? 'Save when your profile feels ready.'
                  : 'Update a field to enable saving.'}
              </span>
            </p>
            <div>
              <button
                className="member-profile-secondary-action"
                type="button"
                onClick={requestCancelEditing}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="member-profile-primary-action"
                type="submit"
                disabled={!canSave}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="member-profile-layout">
          <div className="member-profile-main-column">
            <section className="member-profile-card member-profile-card--accent">
              <MemberProfileCardHeading kicker="Profile" title="About me" />
              {renderBioContent()}
            </section>

            <section className="member-profile-card">
              <MemberProfileCardHeading
                kicker="Mentorship"
                title={
                  user.type === 'mentor'
                    ? 'Areas of Expertise / Industries'
                    : 'Areas of interest'
                }
              />
              {renderExpertiseContent()}
            </section>

            <MemberProfileContact user={user} />
            <MatchActionHistory />
          </div>

          <MemberProfileSummary user={user} />
        </div>
      )}

      <ConfirmationDialog
        open={cancelDialogOpen}
        title="Discard your profile changes?"
        confirmLabel="Discard changes"
        pendingLabel="Discarding..."
        pending={false}
        tone="neutral"
        icon={
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M6 6h8M8 6V4h4v2m-5 0 .5 9h5l.5-9" />
          </svg>
        }
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={() => {
          setCancelDialogOpen(false)
          cancelEditing()
        }}
      >
        <p>
          Your unsaved role, bio, college, and mentorship changes will be lost.
        </p>
      </ConfirmationDialog>
    </main>
  )
}

export default ProfilePage
