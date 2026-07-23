import axios from 'axios'
import { parseMessageResponse } from '../../../shared/contracts'

const backend = '/api/auth'

const passwordResetService = {
  async request(email: string) {
    const response = await axios.post(`${backend}/forgot-password`, { email })
    return parseMessageResponse(response.data)
  },
  async reset(token: string, password: string) {
    const response = await axios.post(`${backend}/reset-password`, {
      token,
      password,
    })
    return parseMessageResponse(response.data)
  },
}

export default passwordResetService
