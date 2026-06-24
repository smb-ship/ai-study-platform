import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import SectionTitle from "../components/SectionTitle"

function Progress() {

  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState("")

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchProgress = () => {
    setLoadError("")
    axios.get(`${import.meta.env.VITE_API_URL}/api/progress/`, { headers })
      .then(res => setData(res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate("/login")
        else setLoadError("Cannot reach the server. Please check your connection and try again.")
      })
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weekActivity = [3, 5, 2, 6, 4, 1, 3]
  const maxActivity = Math.max(...weekActivity)

  const goals = [
    { label: "Daily Notes Goal", target: 3, current: data?.notes_count || 0, color: "bg-[#A78BFA]" },
    { label: "Weekly Quiz Goal", target: 5, current: data?.quizzes_taken || 0, color: "bg-sky-400" },
    { label: "Flashcards Learned", target: 20, current: data?.flashcards_learned || 0, color: "bg-green-400" },
    { label: "Tasks Completed", target: 10, current: data?.tasks_completed || 0, color: "bg-amber-400" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <SectionTitle icon="📈" title="Progress" subtitle="Track your learning journey" />
          <button
            onClick={() => alert("AI learning insights coming soon!")}
            className="bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-500 px-4 py-2 rounded-xl text-sm"
          >
            🤖 AI Insights (Coming Soon)
          </button>
        </div>

        {loadError ? (
          <ErrorMessage message={loadError} retry={fetchProgress} />
        ) : !data ? (
          <Spinner message="Loading progress..." />
        ) : (
          <>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <Card className="text-center">
                <p className="text-3xl font-bold text-[#A78BFA]">{data.notes_count}</p>
                <p className="text-purple-300 text-sm mt-1">Notes Created</p>
              </Card>

              <Card className="text-center">
                <p className="text-3xl font-bold text-sky-500">{data.quizzes_taken}</p>
                <p className="text-purple-300 text-sm mt-1">Quizzes Taken</p>
              </Card>

              <Card className="text-center">
                <p className="text-3xl font-bold text-green-500">{data.flashcards_learned}</p>
                <p className="text-purple-300 text-sm mt-1">Flashcards Learned</p>
              </Card>

              <Card className="text-center">
                <p className="text-3xl font-bold text-amber-500">{data.tasks_completed}</p>
                <p className="text-purple-300 text-sm mt-1">Tasks Completed</p>
              </Card>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

              {/* Weekly Activity Chart */}
              <Card>
                <h2 className="text-lg font-semibold text-[#1E1B4B] mb-6">
                  📊 Weekly Activity
                </h2>
                <div className="flex items-end gap-3 h-32">
                  {weekDays.map((day, i) => (
                    <div key={day} className="flex flex-col items-center flex-1 gap-2">
                      <div
                        className="w-full bg-[#A78BFA] rounded-t-lg transition-all hover:bg-[#8B5CF6]"
                        style={{
                          height: `${(weekActivity[i] / maxActivity) * 100}%`,
                          minHeight: "4px"
                        }}
                      />
                      <p className="text-purple-300 text-xs">{day}</p>
                    </div>
                  ))}
                </div>
                <p className="text-purple-300 text-xs mt-4 text-center">
                  Sample data — real tracking coming soon
                </p>
              </Card>

              {/* Quiz Performance */}
              <Card>
                <h2 className="text-lg font-semibold text-[#1E1B4B] mb-6">
                  🧠 Quiz Performance
                </h2>

                <div className="flex flex-col gap-4">

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Quizzes Taken</p>
                    <p className="text-[#1E1B4B] font-bold text-xl">{data.quizzes_taken}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Average Score</p>
                    <p className="text-sky-500 font-bold text-xl">{data.avg_score}%</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Best Score</p>
                    <p className="text-green-500 font-bold text-xl">{data.best_score}%</p>
                  </div>

                  {/* Score Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-purple-300 mb-1">
                      <span>Average performance</span>
                      <span>{data.avg_score}%</span>
                    </div>
                    <div className="w-full bg-purple-50 rounded-full h-3">
                      <div
                        className="bg-sky-400 h-3 rounded-full transition-all"
                        style={{ width: `${data.avg_score}%` }}
                      />
                    </div>
                  </div>

                </div>
              </Card>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Study Goals */}
              <Card>
                <h2 className="text-lg font-semibold text-[#1E1B4B] mb-6">
                  🎯 Study Goals
                </h2>
                <div className="flex flex-col gap-5">
                  {goals.map((goal) => {
                    const pct = Math.min(
                      Math.round((goal.current / goal.target) * 100), 100
                    )
                    return (
                      <div key={goal.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#1E1B4B]">{goal.label}</span>
                          <span className="text-purple-300">
                            {goal.current} / {goal.target}
                          </span>
                        </div>
                        <div className="w-full bg-purple-50 rounded-full h-2.5">
                          <div
                            className={`${goal.color} h-2.5 rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-purple-300 mt-1">{pct}% complete</p>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Tasks Summary */}
              <Card>
                <h2 className="text-lg font-semibold text-[#1E1B4B] mb-6">
                  📅 Tasks Summary
                </h2>

                <div className="flex flex-col gap-4">

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Total Tasks</p>
                    <p className="text-[#1E1B4B] font-bold text-xl">{data.tasks_total}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Completed</p>
                    <p className="text-green-500 font-bold text-xl">{data.tasks_completed}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-purple-400">Remaining</p>
                    <p className="text-amber-500 font-bold text-xl">{data.tasks_remaining}</p>
                  </div>

                  {/* Completion Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-purple-300 mb-1">
                      <span>Overall completion</span>
                      <span>
                        {data.tasks_total > 0
                          ? Math.round((data.tasks_completed / data.tasks_total) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-50 rounded-full h-3">
                      <div
                        className="bg-green-400 h-3 rounded-full transition-all"
                        style={{
                          width: `${data.tasks_total > 0
                            ? Math.round((data.tasks_completed / data.tasks_total) * 100)
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Flashcards Progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-purple-300 mb-1">
                      <span>Flashcards learned</span>
                      <span>{data.flashcards_learned} / {data.flashcards_total}</span>
                    </div>
                    <div className="w-full bg-purple-50 rounded-full h-3">
                      <div
                        className="bg-[#A78BFA] h-3 rounded-full transition-all"
                        style={{
                          width: `${data.flashcards_total > 0
                            ? Math.round((data.flashcards_learned / data.flashcards_total) * 100)
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                </div>
              </Card>

            </div>

          </>
        )}

      </div>
    </div>
  )
}

export default Progress