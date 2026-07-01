import { useEffect, useState } from "react"
import type { Mentor } from "../interfaces/mentorInterface"
import userService from "../services/userService";
import { useParams } from "react-router-dom";
import LoadingPage from "./LoadingPage";


function MentorPage(){
    const [mentor, setMentor] = useState<Mentor>()
    const [loading, setLoading] = useState(true)
    const { id } = useParams();

    useEffect(() => {
    async function getUsers() {
      const response = await userService.getUser(Number(id))
      console.log(response)

      if (response.message !== 'Forbidden') {
        setMentor(response)
      }
      setLoading(false)
    }

    void getUsers()
  }, [id])
 

  if (loading) {
    return <LoadingPage />
  }

    return (
        <>
        <h1>Mentor: {mentor?.username}</h1>
        <h1>Mentor: {mentor?.email}</h1>
        </>
    )

}

export default MentorPage