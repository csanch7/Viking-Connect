import axios from 'axios'
import { parseCollegesEnvelope } from '../../../shared/contracts'

const collegeService = {
  async getColleges(searchText?: string, signal?: AbortSignal) {
    const response = await axios.get('/api/colleges', {
      params: searchText ? { searchText } : undefined,
      signal,
    })
    return parseCollegesEnvelope(response.data).colleges
  },
}

export default collegeService
