import axios from 'axios'
import { parseCollegesEnvelope } from '../../../shared/contracts'

const collegeService = {
  async getColleges() {
    const response = await axios.get('/api/colleges')
    return parseCollegesEnvelope(response.data).colleges
  },
}

export default collegeService
