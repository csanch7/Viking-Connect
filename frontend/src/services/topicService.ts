import axios from 'axios'
import {
  parseTopicEnvelope,
  parseTopicsEnvelope,
} from '../../../shared/contracts'

const topicService = {
  async getTopics() {
    const response = await axios.get('/api/topics')
    return parseTopicsEnvelope(response.data).topics
  },
  async addTopic(topic: string) {
    const response = await axios.post('/api/topics', { topic })
    return parseTopicEnvelope(response.data).topic
  },
}

export default topicService
