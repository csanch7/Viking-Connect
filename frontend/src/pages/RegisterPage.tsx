import ExpertiseSelector from '../components/expertise/ExpertiseSelector'
import CollegeSelector from '../components/profile/CollegeSelector'
import {
  linkedinProfileUrlPattern,
  useRegistrationForm,
} from '../hooks/useRegistrationForm'

function RegisterPage() {
  const latestGraduationYear = new Date().getFullYear() + 10
  const {
    name,
    setName,
    password,
    setPassword,
    passwordFocused,
    setPasswordFocused,
    email,
    setEmail,
    linkedin,
    setLinkedin,
    confirmPassword,
    setConfirmPassword,
    type,
    setType,
    error,
    isSubmitting,
    bio,
    setBio,
    selectedAreasOfExpertise,
    expertise,
    setExpertise,
    setGradYear,
    passwordRules,
    passwordIsValid,
    linkedinIsValid,
    passwordFieldState,
    linkedinFieldState,
    submit,
    removeExpertise,
    addExpertise,
    navigate,
    setCollege,
    college,
  } = useRegistrationForm()

  return (
    <main className="register-page">
      <section className="register-hero" aria-labelledby="register-title">
        <p className="register-kicker">Viking Connect</p>
        <h1 id="register-title">Create your member profile</h1>
        <p className="register-intro">
          Join as a mentor or mentee so the program team can review your profile
          and connect you with the right alumni network.
        </p>
      </section>

      <form className="register-card" onSubmit={submit}>
        {error && (
          <div className="register-alert" id="registration-error" role="alert">
            {error}
          </div>
        )}

        <section className="register-section" aria-labelledby="account-heading">
          <div className="register-section-heading">
            <span className="register-step">1</span>
            <div>
              <h2 id="account-heading">Account details</h2>
              <p>Use the email and password you will sign in with.</p>
            </div>
          </div>

          <div className="register-grid">
            <label className="register-field" htmlFor="name">
              <span>Name</span>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Mentor"
                required
              />
            </label>

            <label className="register-field" htmlFor="email">
              <span>Email</span>
              <input
                id="email"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </label>

            <label className={passwordFieldState} htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordFocused(false)}
                onFocus={() => setPasswordFocused(true)}
                placeholder="Create a password"
                aria-describedby={
                  passwordFocused ? 'password-requirements' : undefined
                }
                aria-invalid={password.length > 0 && !passwordIsValid}
                required
              />
              {passwordFocused && (
                <ul
                  className="register-password-rules"
                  id="password-requirements"
                >
                  {passwordRules.map((rule) => (
                    <li
                      className={
                        rule.valid
                          ? 'register-password-rule--valid'
                          : 'register-password-rule--invalid'
                      }
                      key={rule.label}
                    >
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </label>

            <label className="register-field" htmlFor="confirmPassword">
              <span>Confirm password</span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </label>
          </div>
        </section>

        <section className="register-section" aria-labelledby="profile-heading">
          <div className="register-section-heading">
            <span className="register-step">2</span>
            <div>
              <h2 id="profile-heading">Program profile</h2>
              <p>Tell the program team how you want to participate.</p>
            </div>
          </div>

          <fieldset className="register-role-group">
            <legend>I am joining as a</legend>
            <label className="register-role-option" htmlFor="mentee">
              <input
                type="radio"
                id="mentee"
                name="typeSelect"
                value="mentee"
                onChange={(e) => setType(e.target.value)}
                required
              />
              <span>
                <strong>Mentee</strong>
                <small>I want guidance from alumni mentors.</small>
              </span>
            </label>
            <label className="register-role-option" htmlFor="mentor">
              <input
                type="radio"
                id="mentor"
                name="typeSelect"
                value="mentor"
                onChange={(e) => setType(e.target.value)}
              />
              <span>
                <strong>Mentor</strong>
                <small>I want to support students or alumni.</small>
              </span>
            </label>
          </fieldset>

          <div className="register-grid">
            <label className={linkedinFieldState} htmlFor="linkedin">
              <span>LinkedIn URL</span>
              <input
                id="linkedin"
                value={linkedin}
                type="url"
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/..."
                pattern={linkedinProfileUrlPattern}
                title="Use a LinkedIn profile URL like https://www.linkedin.com/in/your-name"
                aria-describedby="linkedin-help"
                aria-invalid={linkedin.length > 0 && !linkedinIsValid}
                required
              />
              <small id="linkedin-help">
                Use your personal LinkedIn profile URL. Your profile and contact
                details are shown only to approved Viking Connect members.
              </small>
            </label>

            <label className="register-field" htmlFor="graduationYear">
              <span>Graduation year</span>
              <input
                id="graduationYear"
                type="number"
                inputMode="numeric"
                min="1961"
                max={latestGraduationYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2027"
                required
              />
            </label>

            <CollegeSelector
              selectId="college"
              value={college}
              onChange={setCollege}
              emptyLabel="Choose a college (optional)"
              supportingText="Optional. Add the college you attend or attended."
            />
          </div>
        </section>

        {type && (
          <>
            <section
              className="register-section register-section--highlight"
              aria-labelledby="bio-heading"
            >
              <div className="register-section-heading">
                <span className="register-step">3</span>
                <div>
                  <h2 id="bio-heading">About you</h2>
                  <p>
                    {type === 'mentor'
                      ? 'Share your background, experience, and how you can help.'
                      : 'Share your background, goals, and the guidance you are looking for.'}
                  </p>
                </div>
              </div>

              <label className="register-field" htmlFor="bio">
                <span>Bio</span>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={
                    type === 'mentor'
                      ? 'Share your professional background and mentoring experience...'
                      : 'Share your interests, goals, and what you hope to learn...'
                  }
                  required
                ></textarea>
              </label>
            </section>

            <section
              className="register-section register-section--highlight"
              aria-labelledby="topics-heading"
            >
              <div className="register-section-heading">
                <span className="register-step">4</span>
                <div>
                  <h2 id="topics-heading">
                    {type === 'mentor'
                      ? 'Areas of expertise'
                      : 'Areas of interest'}
                  </h2>
                  <p>
                    {type === 'mentor'
                      ? 'Add at least one area where you can guide mentees.'
                      : 'Add at least one area where you would like guidance.'}
                  </p>
                </div>
              </div>

              <ExpertiseSelector
                selectId="expertiseSelect"
                selectedAreas={selectedAreasOfExpertise}
                selectedArea={expertise}
                onSelectedAreaChange={setExpertise}
                onAddArea={addExpertise}
                onRemoveArea={removeExpertise}
              />
            </section>
          </>
        )}

        <div className="register-actions">
          <button
            className="register-back-link"
            type="button"
            onClick={() => navigate('/login')}
          >
            <span aria-hidden="true">←</span>
            Back to login
          </button>

          <button
            className="register-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit registration'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default RegisterPage
