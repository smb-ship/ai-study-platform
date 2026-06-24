import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"

function Home(){

  const [message, setMessage] = useState("Connecting...")

  useEffect(()=>{
    axios.get(`${import.meta.env.VITE_API_URL}/`)
      .then((res)=>{
        setMessage(res.data.message)
      })
      .catch(()=>{
        setMessage("Backend not connected")
      })
  },[])

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-5">
            AI Study Platform
          </h1>
          <p className="text-xl text-slate-300">
            {message}
          </p>
        </div>
      </div>

    </div>
  )
}

export default Home