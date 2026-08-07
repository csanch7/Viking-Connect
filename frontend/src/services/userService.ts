import axios from 'axios'
import {
  parseMenteeList,
  parseMentorList,
  parseMentorRecommendationsResponse,
  parseMessageResponse,
  parsePublicUser,
  parseSessionResponse,
  parseUserEnvelope,
} from '../../../shared/contracts'

function readStringField(value: unknown, field: string) {
  if (typeof value !== 'object' || value === null || !(field in value)) {
    throw new Error(`Invalid API response: ${field}`)
  }

  const fieldValue = (value as Record<string, unknown>)[field]
  if (typeof fieldValue !== 'string') {
    throw new Error(`Invalid API response: ${field}`)
  }

  return fieldValue
}

function readNullableStringField(value: unknown, field: string) {
  if (typeof value !== 'object' || value === null || !(field in value)) {
    throw new Error(`Invalid API response: ${field}`)
  }

  const fieldValue = (value as Record<string, unknown>)[field]
  if (typeof fieldValue !== 'string' && fieldValue !== null) {
    throw new Error(`Invalid API response: ${field}`)
  }

  return fieldValue
}

function readStringArrayField(value: unknown, field: string) {
  if (typeof value !== 'object' || value === null || !(field in value)) {
    throw new Error(`Invalid API response: ${field}`)
  }

  const fieldValue = (value as Record<string, unknown>)[field]
  if (
    !Array.isArray(fieldValue) ||
    !fieldValue.every((item) => typeof item === 'string')
  ) {
    throw new Error(`Invalid API response: ${field}`)
  }

  return fieldValue
}

const backend = '/api'

const userService = {
  async getMe() {
    const endpoint: string = `${backend}/auth/me`
    const response = await axios.get(endpoint)
    return parseUserEnvelope(response.data)
  },
  async logout() {
    const endpoint: string = `${backend}/auth/logout`
    const response = await axios.post(endpoint)
    return parseMessageResponse(response.data)
  },
  async checkSession() {
    const endpoint: string = `${backend}/auth/session`
    const response = await axios.get(endpoint)
    return parseSessionResponse(response.data)
  },
  async getMentors(
    paginator: number,
    filter: string[] = [],
    searchText?: string,
    college?: string,
  ) {
    const endpoint = `${backend}/mentors/${paginator}`
    const params = new URLSearchParams()

    filter.forEach((area) => params.append('filter', area))

    if (searchText) {
      params.set('searchText', searchText)
    }

    if (college) {
      params.set('college', college)
    }

    const response = await axios.get(endpoint, { params })
    return parseMentorList(response.data)
  },
  async getMentorRecommendations() {
    const endpoint = `${backend}/recommendations/mentors`
    const response = await axios.get(endpoint)
    return parseMentorRecommendationsResponse(response.data).recommendations
  },
  async getMentees(
    paginator: number,
    filter: string[] = [],
    searchText?: string,
    collegeFilter?: string,
  ) {
    const endpoint = `${backend}/mentees/${paginator}`
    const params = new URLSearchParams()

    filter.forEach((area) => params.append('filter', area))

    if (searchText) {
      params.set('searchText', searchText)
    }

    if (collegeFilter) {
      params.set('collegeFilter', collegeFilter)
    }

    const response = await axios.get(endpoint, { params })
    return parseMenteeList(response.data)
  },
  async getMentor(id: string) {
    const endpoint: string = `${backend}/mentor/${id}`
    const response = await axios.get(endpoint)
    return parsePublicUser(response.data)
  },
  async getMentee(id: string) {
    const endpoint: string = `${backend}/mentee/${id}`
    const response = await axios.get(endpoint)
    return parsePublicUser(response.data)
  },
  async updateProfile(
    profile: {
      bio: string
      college: string | null
      areasOfExpertise: string[]
    },
    id: string,
  ) {
    const endpoint = `${backend}/profile/${id}`
    const response = await axios.patch(endpoint, profile)

    return {
      message: readStringField(response.data, 'message'),
      bio: readStringField(response.data, 'bio'),
      college: readNullableStringField(response.data, 'college'),
      areasOfExpertise: readStringArrayField(response.data, 'areasOfExpertise'),
    }
  },
}

export default userService
