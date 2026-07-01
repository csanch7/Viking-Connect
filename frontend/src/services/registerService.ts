import axios from 'axios'
import type { User } from '../interfaces/userInterface'

const backend = '/api'

const registerService = {
  async registerUser(userData: User) {
    const endpoint: string = `${backend}/register`
    const response = await axios.post(endpoint, userData)
    return response.data
  },
}

export default registerService
