import axios from 'axios'
import {
  parseCountResponse,
  parseMessageResponse,
  parsePendingUsersEnvelope,
} from '../../../shared/contracts'

const backend = '/api'

const adminService = {
  async pendingUsers() {
    const endpoint: string = `${backend}/admin/pending-users`
    const response = await axios.get(endpoint)
    return parsePendingUsersEnvelope(response.data).users
  },
  async denyUser(userId: string) {
    const endpoint: string = `${backend}/admin/deny-user/${userId}`
    const response = await axios.post(endpoint)
    return parseMessageResponse(response.data)
  },
  async approveUser(userId: string) {
    const endpoint: string = `${backend}/admin/approve-user/${userId}`
    const response = await axios.post(endpoint)
    return parseMessageResponse(response.data)
  },
  async mentorCount() {
    const endpoint: string = `${backend}/admin/mentor-count`
    const response = await axios.get(endpoint)
    return parseCountResponse(response.data).count
  },
  async menteeCount() {
    const endpoint: string = `${backend}/admin/mentee-count`
    const response = await axios.get(endpoint)
    return parseCountResponse(response.data).count
  },
}

export default adminService
