import { useState } from 'react'
import axios from 'axios'
import registerService from '../services/registerService'
import type { User } from '../interfaces/userInterface'
import { useNavigate } from 'react-router-dom'
import { areasOfExpertise } from '../interfaces/areasOfExpertise'

interface ApiErrorResponse {
  message?: string
}

const passwordSpecialCharacters = '!@#$%^&*()_-+=[{]};:,.?'
const linkedinProfileUrlRegex =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{3,100}\/?$/
const linkedinProfileUrlPattern =
  'https://(www\\.)?linkedin\\.com/in/[A-Za-z0-9-]{3,100}/?'

function getPasswordRules(value: string) {
  return [
    {
      label: 'At least 12 characters',
      valid: value.length >= 12,
    },
    {
      label: 'One uppercase letter',
      valid: /[A-Z]/.test(value),
    },
    {
      label: 'One lowercase letter',
      valid: /[a-z]/.test(value),
    },
    {
      label: 'One number',
      valid: /\d/.test(value),
    },
    {
      label: 'One special character',
      valid: [...value].some((character) =>
        passwordSpecialCharacters.includes(character),
      ),
    },
  ]
}

function RegisterForm() {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [linkedin, setLinkedin] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [error, setError] = useState<string | null>('')
  const [helpText, setHelpText] = useState<string>('')
  const [aoeList, setAoeList] = useState<string[]>([])
  const [expertise, setExpertise] = useState<string>('')
  const [gradYear, setGradYear] = useState<number>(0)

  const navigate = useNavigate()
  const passwordRules = getPasswordRules(password)
  const passwordIsValid = passwordRules.every((rule) => rule.valid)
  const trimmedLinkedin = linkedin.trim()
  const linkedinIsValid = linkedinProfileUrlRegex.test(trimmedLinkedin)
  const passwordFieldState =
    password.length === 0
      ? 'register-field'
      : passwordIsValid
        ? 'register-field register-field--valid'
        : 'register-field register-field--invalid'
  const linkedinFieldState =
    linkedin.length === 0
      ? 'register-field'
      : linkedinIsValid
        ? 'register-field register-field--valid'
        : 'register-field register-field--invalid'

  function handleUsername(value: string) {
    setUsername(value)
  }

  function handlePassword(value: string) {
    setPassword(value)
  }

  function handleConfirmedPassword(value: string) {
    setConfirmPassword(value)
  }

  function handleType(value: string) {
    setType(value)
  }

  function handleEmail(value: string) {
    setEmail(value)
  }

  function handleLinkedin(value: string) {
    setLinkedin(value)
  }

  function handleHelpText(value: string) {
    setHelpText(value)
  }

  function handleGradYear(value: string) {
    const year = Number(value)
    setGradYear(year)
  }

  function handleError(value: string) {
    setError(value);
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      setError(null)
    }, 3000);
  }

  async function handleSignUp(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (aoeList.length === 0 && type === 'mentor') {
      handleError('Choose at least one area of expertise')
      return
    }
    if (gradYear < 1961) {
      handleError('Select a valid graduation year')
      return
    }
    if (!passwordIsValid) {
      handleError('Password does not meet the requirements')
      return
    }
    if (password !== confirmPassword) {
      handleError('Make sure passwords match')
      return
    }
    if (!linkedinIsValid) {
      handleError('Enter a valid LinkedIn profile URL')
      return
    }

    const user: User = {
      username: username,
      password: password,
      email: email,
      linkedin: trimmedLinkedin,
      type: type,
      helpText: helpText,
      aoeList: aoeList,
      gradYear: gradYear,
    }

    try {
      const response = await registerService.registerUser(user)

      if (response.message === 'User created') {
        navigate('/verification')
      }
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        handleError(
          error.response?.data.message ?? 'Unable to create your account',
        )
        return
      }

      handleError('Unable to create your account')
    }
  }

  function removeExpertise(area: string) {
    setAoeList((previousList) => previousList.filter((item) => item !== area))
  }

  return (
    <main className="register-page">
      <section className="register-hero" aria-labelledby="register-title">
        <p className="register-kicker">STL Mentorship Program</p>
        <h1 id="register-title">Create your member profile</h1>
        <p className="register-intro">
          Join as a mentor or mentee so the program team can review your
          profile and connect you with the right alumni network.
        </p>
      </section>

      <form className="register-card" onSubmit={(e) => handleSignUp(e)}>
        {error && (
          <div className="register-alert" role="alert">
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
            <label className="register-field" htmlFor="username">
              <span>Name</span>
              <input
                id="username"
                value={username}
                onChange={(e) => handleUsername(e.target.value)}
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
                onChange={(e) => handleEmail(e.target.value)}
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
                onChange={(e) => handlePassword(e.target.value)}
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
                onChange={(e) => handleConfirmedPassword(e.target.value)}
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
                onChange={(e) => handleType(e.target.value)}
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
                onChange={(e) => handleType(e.target.value)}
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
                onChange={(e) => handleLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/..."
                pattern={linkedinProfileUrlPattern}
                title="Use a LinkedIn profile URL like https://www.linkedin.com/in/your-name"
                aria-describedby="linkedin-help"
                aria-invalid={linkedin.length > 0 && !linkedinIsValid}
                required
              />
            </label>

            <label className="register-field" htmlFor="graduationYear">
              <span>Graduation year</span>
              <input
                id="graduationYear"
                onChange={(e) => handleGradYear(e.target.value)}
                placeholder="2027"
                required
              />
            </label>
          </div>
        </section>

        {type === 'mentee' && (
          <section
            className="register-section register-section--highlight"
            aria-labelledby="mentee-heading"
          >
            <div className="register-section-heading">
              <span className="register-step">3</span>
              <div>
                <h2 id="mentee-heading">Mentorship goals</h2>
                <p>Share what kind of support would be most useful.</p>
              </div>
            </div>

            <label className="register-field" htmlFor="helpText">
              <span>What help are you looking for?</span>
              <textarea
                id="helpText"
                value={helpText}
                onChange={(e) => handleHelpText(e.target.value)}
                placeholder="Career advice, interview prep, industry insight..."
                required
              ></textarea>
            </label>
          </section>
        )}

        {type === 'mentor' && (
          <section
            className="register-section register-section--highlight"
            aria-labelledby="mentor-heading"
          >
            <div className="register-section-heading">
              <span className="register-step">3</span>
              <div>
                <h2 id="mentor-heading">Areas of expertise</h2>
                <p>Add at least one area where you can guide mentees.</p>
              </div>
            </div>

            <div className="register-expertise-row">
              <label className="register-field" htmlFor="sltExpertise">
                <span>Select an area</span>
                <div className="register-expertise-control">
                  <select
                    id="sltExpertise"
                    name="sltExpertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                  >
                    <option value="" disabled>
                      Choose expertise
                    </option>
                    {areasOfExpertise.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>

                  <button
                    className="register-secondary-button"
                    type="button"
                    onClick={() => {
                      if (expertise && !aoeList.includes(expertise)) {
                        setAoeList((previousList) => [
                          ...previousList,
                          expertise,
                        ])
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </label>
            </div>

            {aoeList.length > 0 && (
              <ul className="register-chip-list" aria-label="Selected expertise">
                {aoeList.map((area) => (
                  <li key={area}>
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => removeExpertise(area)}
                      aria-label={`Remove ${area}`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="register-actions">
          <button
            className="register-back-link"
            type="button"
            onClick={() => navigate('/')}
          >
            <span aria-hidden="true">←</span>
            Back to login
          </button>

          <button className="register-submit-button" type="submit">
            Submit registration
          </button>
        </div>
      </form>
    </main>
  )
}

export default RegisterForm
