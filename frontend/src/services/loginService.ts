import axios from 'axios'
import { parseMessageResponse } from '../../../shared/contracts'

export interface LoginUser {
  email: string
  password: string
}

const backend = '/api'

const loginService = {
  async login(userData: LoginUser) {
    const user = {
      email: userData.email,
      password: userData.password,
    }
    const endpoint: string = `${backend}/auth/login`
    const response = await axios.post(endpoint, user)
    return parseMessageResponse(response.data)
  },
}

export default loginService
