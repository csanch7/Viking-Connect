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
  async getMentors(paginator: number) {
    const endpoint: string = `${backend}/mentors/${paginator}`
    const response = await axios.get(endpoint)
    return response.data
  },
  async getUser(id: number) {
    const endpoint: string = `${backend}/user/${id}`
    const response = await axios.get(endpoint)
    return response.data
  },
}

export default userService
