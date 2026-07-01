import { Link } from 'react-router-dom'
import userService from '../services/userService'
import { useEffect, useState } from 'react'
import LoadingPage from './LoadingPage'

function AdminPage() {
  const [status, setStatus] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await userService.checkSession()

        if (response.admin) {
          setLoading(false)
          setStatus(true)

          return
        }
      } catch {
        // If the check fails, leave the visitor on the sign-in page.
      }
    }

    void checkSession()
  })


  if (loading) {
    return <LoadingPage />
  }
  if (status === false) {
    return <h1>You are not allowed here!!!</h1>
  }

  return (
    <>
      <h1>Hello this is the admin Page </h1>
      <p>Click </p> <Link to="/admin/pending-users">here</Link>{' '}
      <p> to view pending users</p>
    </>
  )
}

export default AdminPage
