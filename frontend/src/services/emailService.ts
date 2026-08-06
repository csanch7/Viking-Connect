import axios from 'axios'
import {
  parseMessageResponse,
  type EmailRequest,
} from '../../../shared/contracts'

const backend = '/api'

const emailService = {
  async sendContactUsEmail(emailData: EmailRequest) {
    const endpoint: string = `${backend}/contact-us`
    const response = await axios.post(endpoint, emailData)
    return parseMessageResponse(response.data)
  },
}

export default emailService
