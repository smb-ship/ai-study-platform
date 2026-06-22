import { Link, useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"

function Sidebar() {

  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/notes",     label: "Notes",     icon: "📝" },
    { path: "/tutor",     label: "AI Tutor",  icon: "🤖" },
    { path: "/quiz",      label: "Quiz",      icon: "🧠" },
    { path: "/flashcards",label: "Flashcards",icon: "🃏" },
    { path: "/planner",   label: "Planner",   icon: "📅" },
    { path: "/progress",  label: "Progress",  icon: "📈" },
    { path: "/settings",  label: "Settings",  icon: "⚙️" },
  ]

  return (
    <div className="w-64 min-h-screen bg-[#F7F5FF] p-5">

      {/* Floating white sidebar card */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex flex-col h-[calc(100vh-2.5rem)]">

        {/* Logo */}
        <h1 className="text-xl font-bold text-[#1E1B4B] mb-10 flex items-center gap-2">
          <span className="text-2xl">🎓</span> AI Study
        </h1>

        {/* Nav Links */}
        <div className="flex flex-col gap-1.5 flex-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${location.pathname === link.path
                  ? "bg-[#A78BFA] text-white shadow-sm"
                  : "text-[#6B7280] hover:bg-purple-50 hover:text-[#1E1B4B]"
                }
              `}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token")
            navigate("/login")
          }}
          className="mt-6 bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-3 rounded-xl text-sm font-medium w-full transition-all"
        >
          🚪 Logout
        </button>

      </div>
    </div>
  )
}

export default Sidebar