import { useState } from 'react'
import registerService from '../services/registerService'
import type { User } from '../interfaces/userInterface'
import { useNavigate } from 'react-router-dom'

function RegisterForm() {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [linkedin, setLinkedin] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [type, setType] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [helpText, setHelpText] = useState<string>('')
  const [aoeList, setAoeList] = useState<string[]>([])
  const [expertise, setExpertise] = useState<string>('')
  const [gradYear, setGradYear] = useState<number>(0)

  const navigate = useNavigate()

  const areasOfExpertise: string[] = [
    'Finance',
    'Accounting',
    'Cybersecurity',
    'Product Management',
    'Growth',
    'Programming',
    'Databases',
  ]
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

  async function handleSignUp(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (aoeList.length === 0 && type === 'mentor') {
      setError('Choose at least one area of expertise!!')
      return
    }
    if (gradYear < 1961) {
      setError('Select a valid graduation year!!!')
      return
    }
    if (password !== confirmPassword) {
      setError('Make passwords match!!!')
      return
    }

    const user: User = {
      username: username,
      password: password,
      email: email,
      linkedin: linkedin,
      type: type,
      helpText: helpText,
      aoeList: aoeList,
      gradYear: gradYear,
    }

    const response = await registerService.registerUser(user)

    if (response.message === 'User created') {
      navigate('/verification')
    }
  }

  function removeExpertise(area: string) {
    setAoeList((previousList) => previousList.filter((item) => item !== area))
  }

  return (
    <>
      <h1>Register Form</h1>
      <h3>{error}</h3>
      <form onSubmit={(e) => handleSignUp(e)}>
        <input
          value={username}
          onChange={(e) => handleUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <br />
        <input
          value={password}
          type="password"
          onChange={(e) => handlePassword(e.target.value)}
          placeholder="Password"
          required
        />
        <br />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => handleConfirmedPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <br />

        <input
          type="radio"
          id="mentee"
          name="typeSelect"
          value="mentee"
          onChange={(e) => handleType(e.target.value)}
          required
        />
        <label htmlFor="mentee">Mentee</label>
        <br />
        <input
          type="radio"
          id="mentor"
          name="typeSelect"
          value="mentor"
          onChange={(e) => handleType(e.target.value)}
        />
        <label htmlFor="mentor">Mentor</label>
        <br />

        <br />

        <input
          value={email}
          type="email"
          onChange={(e) => handleEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <br />
        <input
          value={linkedin}
          type="url"
          onChange={(e) => handleLinkedin(e.target.value)}
          placeholder="LinkedIn URL"
          required
        />

        <br />
        <label htmlFor="graduationYear">Graduation Year</label>
        <br />
        <input
          id="graduationYear"
          onChange={(e) => handleGradYear(e.target.value)}
          placeholder="Graduation Year"
          required
        />

        <br />

        {type === 'mentee' && (
          <>
            <textarea
              value={helpText}
              onChange={(e) => handleHelpText(e.target.value)}
              placeholder="What help are you looking for?"
              required
            ></textarea>
            <br />
          </>
        )}

        {type === 'mentor' && (
          <>
            <label htmlFor="sltExpertise">Select Areas of Expertise: </label>

            <select
              id="sltExpertise"
              name="sltExpertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
            >
              <option value="" disabled>
                Select expertise
              </option>
              {areasOfExpertise.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (expertise && !aoeList.includes(expertise)) {
                  setAoeList((previousList) => [...previousList, expertise])
                }
              }}
            >
              Add Expertise
            </button>

            {aoeList.map((area) => (
              <div key={area}>
                <span>{area}</span>
                <button type="button" onClick={() => removeExpertise(area)}>
                  Remove
                </button>
              </div>
            ))}
          </>
        )}
        <br />

        <button type="submit">Submit</button>
      </form>
    </>
  )
}

export default RegisterForm
