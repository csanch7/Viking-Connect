import userService from '../services/userService'
import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import LoadingPage from './LoadingPage'

interface pendingUser {
  id: string
  username: string
  email: string
  linkedin: string
  type: string
  helpText: string
  aoeList: string[]
  gradYear: number
  role: string
}

function PendingUsersPage() {
  const [users, setUsers] = useState<pendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkSession() {
      
      const response = await userService.checkSession()
      if (!response.admin) {
        setLoading(false)
        setStatus(true)
        return
      }
      setLoading(false)
      setUsers(await adminService.pendingUsers())
      
    }

    void checkSession()
  }, [])

  async function denyUser(userId: string) {
    await adminService.denyUser(userId)
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    )
    setMessage('User denied')
  }

  async function approveUser(userId: string) {
    await adminService.approveUser(userId)
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    )
    setMessage('User approved')
  }

  if (loading) {
    return <LoadingPage />
  }

  if (status === true) {
    return <h1>You are not allowed here!!!</h1>
  }

  return (
    <>
      {message && <p>{message}</p>}
      {users.map((user: pendingUser) => (
        <div key={user.id}>
          <h1>{user.username}</h1>
          <p>{user.email}</p>
          <p>{user.linkedin}</p>
          <p>{user.type}</p>
          <p>{user.helpText}</p>
          <p>{user.aoeList.join(', ')}</p>
          <p>{user.gradYear}</p>
          <p>{user.role}</p>
          <button onClick={() => denyUser(user.id)}>Deny</button>
          <button onClick={() => approveUser(user.id)}>Approve</button>
        </div>
      ))}
    </>
  )
}

export default PendingUsersPage
