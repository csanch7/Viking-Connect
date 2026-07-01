import { useEffect, useState } from 'react'
import userService from '../services/userService'
import type { Mentor } from '../interfaces/mentorInterface'
import { Link } from 'react-router-dom'
import LoadingPage from './LoadingPage'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(0)
  const [mentors, setMentors] = useState<Mentor[]>([])
  useEffect(() => {
    async function getUsers() {
      const response = await userService.getMentors(page)
      console.log(response)

      if (response.message !== 'Forbidden') {
        setLoading(false)
        setMentors(response)
      }
    }

    void getUsers()
  }, [page])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <>
      <h1>Here are the mentors</h1>
      {mentors.map((mentor: Mentor) => (
        <div key={mentor.id}>
          <Link to={`/user/${mentor.id}`}>{mentor.username}</Link>
          <p>{mentor.email}</p>
          <p>{mentor.linkedin}</p>
          <p>{mentor.aoeList.join(', ')}</p>

        </div>
      ))}
      <p>Page {page} </p>
      <button onClick={()=> setPage(page+1)}>Next Page</button>
    </>
  )
}

export default DashboardPage
