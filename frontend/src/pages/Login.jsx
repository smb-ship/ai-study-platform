import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"


function Login(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [message,setMessage] = useState("")


const handleLogin = async()=>{


try{


const res = await axios.post(
"http://127.0.0.1:5000/api/login",
{
email,
password
}
)


setMessage(res.data.message)

localStorage.setItem(
"token",
res.data.token
)

navigate("/dashboard")

}


catch(err){


console.log(err)


setMessage(
err.response?.data?.error ||
"Login failed"
)


}


}



return (

<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">


<motion.div

initial={{opacity:0,y:30}}

animate={{opacity:1,y:0}}

className="bg-slate-900 p-10 rounded-2xl w-96"

>


<h1 className="text-3xl font-bold mb-6 text-center">
Login
</h1>


<input

className="w-full mb-4 p-3 rounded bg-slate-800"

placeholder="Email"

onChange={(e)=>setEmail(e.target.value)}

/>


<input

className="w-full mb-6 p-3 rounded bg-slate-800"

placeholder="Password"

type="password"

onChange={(e)=>setPassword(e.target.value)}

/>



<button

onClick={handleLogin}

className="w-full bg-purple-600 py-3 rounded-xl"

>

Login

</button>



{message &&

<p className="mt-4 text-center">

{message}

</p>

}


</motion.div>


</div>

)

}


export default Login