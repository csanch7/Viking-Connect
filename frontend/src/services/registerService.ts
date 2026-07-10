import axios from 'axios'
import type { User } from '../types/user'

const backend = '/api'

const registerService = {
  async registerUser(userData: User) {
    const endpoint: string = `${backend}/register`
    const response = await axios.post(endpoint, userData)
    return response.data
  },
}

export default registerService
