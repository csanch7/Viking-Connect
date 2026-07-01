import axios from 'axios'

export interface loginUser {
  email: string
  password: string
}

const backend = '/api'

const loginService = {
  async loginUser(userData: loginUser) {
    const user = {
      email: userData.email,
      password: userData.password,
    }
    const endpoint: string = `${backend}/auth/login`
    const response = await axios.post(endpoint, user)
    return response.data
  },
}

export default loginService
