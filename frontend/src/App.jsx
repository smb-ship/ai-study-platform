import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

import Notes from "./pages/Notes"
import Tutor from "./pages/Tutor"
import Quiz from "./pages/Quiz"
import Flashcards from "./pages/Flashcards"
import Planner from "./pages/Planner"
import Progress from "./pages/Progress"
import Settings from "./pages/Settings"

import ProtectedRoute from "./components/ProtectedRoute"


function App() {

return (

<BrowserRouter>

<Routes>


<Route path="/" element={<Home />} />


<Route path="/login" element={<Login />} />


<Route path="/register" element={<Register />} />



<Route

path="/dashboard"

element={

<ProtectedRoute>

<Dashboard />

</ProtectedRoute>

}

/>



<Route path="/notes" element={

<ProtectedRoute>
<Notes />
</ProtectedRoute>

}/>



<Route path="/tutor" element={
  <ProtectedRoute>
    <Tutor />
  </ProtectedRoute>
}/>



<Route path="/quiz" element={

<ProtectedRoute>
<Quiz />
</ProtectedRoute>

}/>



<Route path="/flashcards" element={

<ProtectedRoute>
<Flashcards />
</ProtectedRoute>

}/>



<Route path="/planner" element={

<ProtectedRoute>
<Planner />
</ProtectedRoute>

}/>



<Route path="/progress" element={

<ProtectedRoute>
<Progress />
</ProtectedRoute>

}/>



<Route path="/settings" element={

<ProtectedRoute>
<Settings />
</ProtectedRoute>

}/>



</Routes>

</BrowserRouter>

)

}


export default App