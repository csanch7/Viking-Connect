import axios from 'axios'

const backend = '/api'

const adminService = {
  async pendingUsers() {
    const endpoint: string = `${backend}/admin/pending-users`
    const response = await axios.get(endpoint)
    return response.data.users
  },
  async denyUser(userId: string) {
    const endpoint: string = `${backend}/admin/deny-user/${userId}`
    const response = await axios.post(endpoint)
    return response.data
  },
  async approveUser(userId: string) {
    const endpoint: string = `${backend}/admin/approve-user/${userId}`
    const response = await axios.post(endpoint)
    return response.data
  },
  async mentorCount() {
    const endpoint: string = `${backend}/admin/mentor-count`
    const response = await axios.get(endpoint)
    return response.data.count
  },
  async menteeCount() {
    const endpoint: string = `${backend}/admin/mentee-count`
    const response = await axios.get(endpoint)
    return response.data.count
  },
}

export default adminService
