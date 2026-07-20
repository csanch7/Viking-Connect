import axios from 'axios'
import { parseTopicsEnvelope } from '../../../shared/contracts'

const topicService = {
  async getTopics() {
    const response = await axios.get('/api/topics')
    return parseTopicsEnvelope(response.data).topics
  },
}

export default topicService
