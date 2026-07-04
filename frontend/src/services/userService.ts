import axios from 'axios'

const backend = '/api'

const userService = {
  async getMe() {
    const endpoint: string = `${backend}/auth/me`
    const response = await axios.get(endpoint)
    return response.data
  },
  async logout() {
    const endpoint: string = `${backend}/auth/logout`
    const response = await axios.post(endpoint)
    return response.data
  },
  async checkSession() {
    const endpoint: string = `${backend}/auth/session`
    const response = await axios.get(endpoint)
    return response.data
  },
  async getMentors(paginator: number, filter: string[] = []) {
    const endpoint = `${backend}/mentors/${paginator}`
    const params = new URLSearchParams()

    filter.forEach((area) => params.append('filter', area))

    const response = await axios.get(endpoint, { params })
    return response.data
  },
  async getUser(id: number) {
    const endpoint: string = `${backend}/user/${id}`
    const response = await axios.get(endpoint)
    return response.data
  },
  async updateHelpText(helpText: string, id: string) {
    const endpoint: string = `${backend}/change-text/${id}`
    const response = await axios.patch(
      endpoint, 
      {
        "helpText": helpText
      }
    )
    return response.data
  }
}

export default userService
