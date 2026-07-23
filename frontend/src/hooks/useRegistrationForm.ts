import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import registerService from '../services/registerService'
import type { User } from '../types/user'

const passwordSpecialCharacters = '!@#$%^&*()_-+=[{]};:,.?'
export const linkedinProfileUrlPattern =
  'https://(www\\.)?linkedin\\.com/in/[A-Za-z0-9-]{3,100}/?'
const linkedinProfileUrlRegex =
  /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{3,100}\/?$/
const earliestGraduationYear = 1961
const latestGraduationYear = new Date().getFullYear() + 10

interface ApiErrorResponse {
  message?: string
}

function getPasswordRules(value: string) {
  return [
    { label: 'At least 12 characters', valid: value.length >= 12 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(value) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(value) },
    { label: 'One number', valid: /\d/.test(value) },
    {
      label: 'One special character',
      valid: [...value].some((character) =>
        passwordSpecialCharacters.includes(character),
      ),
    },
  ]
}

export function useRegistrationForm() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [type, setType] = useState('')
  const [error, setError] = useState<string | null>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bio, setBio] = useState('')
  const [selectedAreasOfExpertise, setSelectedAreasOfExpertise] = useState<
    string[]
  >([])
  const [expertise, setExpertise] = useState('')
  const [gradYear, setGradYear] = useState(0)
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

  function showError(value: string) {
    setError(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (selectedAreasOfExpertise.length === 0) {
      showError(
        type === 'mentor'
          ? 'Choose at least one area of expertise'
          : 'Choose at least one area of interest',
      )
      return
    }
    if (
      !Number.isInteger(gradYear) ||
      gradYear < earliestGraduationYear ||
      gradYear > latestGraduationYear
    ) {
      showError('Select a valid graduation year')
      return
    }
    if (!passwordIsValid) {
      showError('Password does not meet the requirements')
      return
    }
    if (password !== confirmPassword) {
      showError('Make sure passwords match')
      return
    }
    if (!linkedinIsValid) {
      showError('Enter a valid LinkedIn profile URL')
      return
    }

    const user: User = {
      name,
      password,
      email,
      linkedin: trimmedLinkedin,
      type,
      bio,
      areasOfExpertise: selectedAreasOfExpertise,
      gradYear,
    }

    try {
      setIsSubmitting(true)
      const response = await registerService.registerUser(user)
      if (response.message === 'User created') {
        navigate('/verification')
      } else {
        showError('Unable to create your account')
        setIsSubmitting(false)
      }
    } catch (caughtError) {
      setIsSubmitting(false)
      if (axios.isAxiosError<ApiErrorResponse>(caughtError)) {
        showError(
          caughtError.response?.data.message ?? 'Unable to create your account',
        )
      } else {
        showError('Unable to create your account')
      }
    }
  }

  function removeExpertise(area: string) {
    setSelectedAreasOfExpertise((list) => list.filter((item) => item !== area))
  }

  function addExpertise() {
    if (expertise && !selectedAreasOfExpertise.includes(expertise)) {
      setSelectedAreasOfExpertise((list) => [...list, expertise])
    }
  }

  return {
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
    setGradYear: (value: string) => setGradYear(Number(value)),
    passwordRules,
    passwordIsValid,
    linkedinIsValid,
    passwordFieldState,
    linkedinFieldState,
    submit,
    removeExpertise,
    addExpertise,
    navigate,
  }
}
