import axios from 'axios'
import {
  parseMentorList,
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
  ) {
    const endpoint = `${backend}/mentors/${paginator}`
    const params = new URLSearchParams()

    filter.forEach((area) => params.append('filter', area))

    if (searchText) {
      params.set('searchText', searchText)
    }

    const response = await axios.get(endpoint, { params })
    return parseMentorList(response.data)
  },
  async getMentor(id: string) {
    const endpoint: string = `${backend}/mentor/${id}`
    const response = await axios.get(endpoint)
    return parsePublicUser(response.data)
  },
  async updateBio(bio: string, id: string) {
    const endpoint: string = `${backend}/change-bio/${id}`
    const response = await axios.patch(endpoint, {
      bio,
    })
    return {
      message: readStringField(response.data, 'message'),
      bio: readStringField(response.data, 'bio'),
    }
  },
  async updateAreasOfExpertise(areasOfExpertise: string[], id: string) {
    const endpoint: string = `${backend}/change-areas-of-expertise/${id}`
    const response = await axios.patch(endpoint, {
      areasOfExpertise,
    })
    return {
      message: readStringField(response.data, 'message'),
      areasOfExpertise: readStringArrayField(response.data, 'areasOfExpertise'),
    }
  },
}

export default userService
