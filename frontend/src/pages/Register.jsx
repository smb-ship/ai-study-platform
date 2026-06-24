import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register() {

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [message,setMessage] = useState("");
const [error,setError] = useState("");


const handleRegister = async()=>{

setMessage("");
setError("");

try{

const response = await axios.post(
`${import.meta.env.VITE_API_URL}/api/register`,
{
name,
email,
password
},
{
headers:{
"Content-Type":"application/json"
}
}
);


setMessage(response.data.message);


}

catch(err){

if(err.response){

setError(
err.response.data.error || "Server error"
);

}
else{

setError("Backend not connected");

}

}

}



return (

<div className="
min-h-screen
bg-slate-950
flex
items-center
justify-center
">


<motion.div

initial={{opacity:0,y:30}}

animate={{opacity:1,y:0}}

className="
bg-slate-900
p-10
rounded-2xl
w-96
shadow-xl
"

>


<h1 className="
text-white
text-3xl
font-bold
text-center
mb-6
">

Create Account

</h1>


<input

className="
w-full
mb-4
p-3
rounded-xl
bg-slate-800
text-white
"

placeholder="Name"

value={name}

onChange={(e)=>setName(e.target.value)}

/>


<input

className="
w-full
mb-4
p-3
rounded-xl
bg-slate-800
text-white
"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>


<input

className="
w-full
mb-4
p-3
rounded-xl
bg-slate-800
text-white
"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<button

onClick={handleRegister}

className="
w-full
bg-purple-600
text-white
p-3
rounded-xl
hover:bg-purple-700
"

>

Register

</button>


{message &&

<p className="text-green-400 mt-4 text-center">

{message}

</p>

}


{error &&

<p className="text-red-400 mt-4 text-center">

{error}

</p>

}


</motion.div>


</div>

)

}