import axios from 'axios'
import {
  parseActiveTopicsEnvelope,
  parseIsActiveEnvelope,
  parseTopicEnvelope,
  parseTopicsEnvelope,
} from '../../../shared/contracts'

const topicService = {
  async getActiveTopics() {
    const response = await axios.get('/api/active-topics')
    return parseActiveTopicsEnvelope(response.data).topics
  },
  async getTopics() {
    const response = await axios.get('/api/topics')
    return parseTopicsEnvelope(response.data).topics
  },
  async addTopic(topic: string) {
    const response = await axios.post('/api/topics', { topic })
    return parseTopicEnvelope(response.data).topic
  },
  async updateTopic(id: string) {
    const response = await axios.put(`/api/topics/${id}`)
    return parseIsActiveEnvelope(response.data).is_active
  },
}

export default topicService
