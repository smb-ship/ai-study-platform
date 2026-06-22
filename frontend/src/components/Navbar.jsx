import { Link } from "react-router-dom"

function Navbar() {
  return (
    <div className="bg-slate-900 px-8 py-4 flex justify-between items-center border-b border-slate-700">

      <h1 className="text-xl font-bold text-white">
        AI Study Platform
      </h1>

      <div className="flex gap-4">

        <Link
          to="/login"
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-xl font-semibold"
        >
          Register
        </Link>

      </div>

    </div>
  )
}

export default Navbar