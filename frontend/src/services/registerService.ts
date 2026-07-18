import axios from 'axios'
import type { User } from '../types/user'
import { parseMessageResponse } from '../../../shared/contracts'

const backend = '/api'

const registerService = {
  async registerUser(userData: User) {
    const endpoint: string = `${backend}/register`
    const response = await axios.post(endpoint, userData)
    return parseMessageResponse(response.data)
  },
}

export default registerService
