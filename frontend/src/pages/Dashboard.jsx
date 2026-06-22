import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import Card from "../components/Card"
import SectionTitle from "../components/SectionTitle"

function Dashboard() {

  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/me", { headers }),
          axios.get("http://127.0.0.1:5000/api/progress/summary", { headers })
        ])
        setUser(userRes.data)
        setStats(statsRes.data)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/login")
        } else {
          setError("Failed to load dashboard")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-purple-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Notes Created", value: stats?.notes_count ?? 0, emoji: "📝", color: "text-[#A78BFA]" },
    { label: "Quizzes Taken", value: stats?.quizzes_taken ?? 0, emoji: "🧠", color: "text-sky-500" },
    { label: "Flashcards Learned", value: stats?.flashcards_learned ?? 0, emoji: "🃏", color: "text-pink-400" },
    { label: "Tasks Due Today", value: stats?.tasks_today ?? 0, emoji: "📅", color: "text-amber-500" },
  ]

  const quickAccess = [
    { path: "/notes", emoji: "📝", label: "Notes", sub: `${stats?.notes_count ?? 0} notes` },
    { path: "/tutor", emoji: "🤖", label: "AI Tutor", sub: "Coming soon" },
    { path: "/quiz", emoji: "🧠", label: "Quiz", sub: `${stats?.quizzes_taken ?? 0} taken` },
    { path: "/flashcards", emoji: "🃏", label: "Flashcards", sub: `${stats?.flashcards_learned ?? 0} learned` },
    { path: "/planner", emoji: "📅", label: "Planner", sub: `${stats?.tasks_today ?? 0} due today` },
    { path: "/progress", emoji: "📈", label: "Progress", sub: "View analytics" },
    { path: "/settings", emoji: "⚙️", label: "Settings", sub: "Manage account" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10">

        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-br from-[#A78BFA] to-[#F9A8D4] border-none">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user ? user.name : "..."} 👋
          </h1>
          <p className="text-white/80 mt-2">
            {user ? user.email : ""}
          </p>
        </Card>

        {error && (
          <p className="text-red-500 mb-6 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {statCards.map((card) => (
            <Card key={card.label}>
              <p className="text-2xl mb-2">{card.emoji}</p>
              <p className="text-[#6B7280] text-sm mb-1">{card.label}</p>
              <h2 className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </h2>
            </Card>
          ))}
        </div>

        {/* Quick Access */}
        <SectionTitle icon="✨" title="Quick Access" subtitle="Jump back into your studies" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickAccess.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white hover:shadow-md border border-purple-100 hover:border-[#A78BFA] rounded-2xl p-5 text-left transition-all"
            >
              <p className="text-2xl mb-2">{item.emoji}</p>
              <p className="font-semibold text-[#1E1B4B]">{item.label}</p>
              <p className="text-[#9CA3AF] text-xs mt-1">{item.sub}</p>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Dashboard