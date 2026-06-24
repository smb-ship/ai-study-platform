import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"

function Planner() {

  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [activeTab, setActiveTab] = useState("today")

  const [form, setForm] = useState({
    title: "", subject: "", date: "", time: "", priority: "Medium"
  })

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const today = new Date().toISOString().split("T")[0]

  const fetchTasks = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/planner/`, { headers })
      setTasks(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login")
      } else {
        setLoadError("Cannot reach the server. Please check your connection and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")

    if (!form.title || !form.subject || !form.date) {
      setError("Title, subject and date are required")
      return
    }

    try {
      if (editingTask) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/planner/${editingTask.id}`,
          form, { headers }
        )
        setSuccess("Task updated!")
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/planner/`, form, { headers })
        setSuccess("Task created!")
      }

      setForm({ title: "", subject: "", date: "", time: "", priority: "Medium" })
      setEditingTask(null)
      fetchTasks()
      setTimeout(() => setSuccess(""), 2000)

    } catch (err) {
      setError("Failed to save task")
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title,
      subject: task.subject,
      date: task.date,
      time: task.time || "",
      priority: task.priority
    })
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setEditingTask(null)
    setForm({ title: "", subject: "", date: "", time: "", priority: "Medium" })
    setError("")
  }

  const handleToggleComplete = async (task) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/planner/${task.id}`,
        { ...task, completed: !task.completed },
        { headers }
      )
      fetchTasks()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/planner/${taskId}`, { headers })
      fetchTasks()
    } catch (err) {
      setError("Failed to delete task")
    }
  }

  const todayTasks = tasks.filter(t => t.date === today && !t.completed)
  const upcomingTasks = tasks.filter(t => t.date > today && !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  const priorityColor = {
    "High": "text-red-500 bg-red-50 border-red-100",
    "Medium": "text-amber-500 bg-amber-50 border-amber-100",
    "Low": "text-green-500 bg-green-50 border-green-100"
  }

  const tabTasks = activeTab === "today" ? todayTasks : activeTab === "upcoming" ? upcomingTasks : completedTasks

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <Spinner message="Loading planner..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <ErrorMessage message={loadError} retry={fetchTasks} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <SectionTitle icon="📅" title="Planner" subtitle="Organize your study schedule" />
          <button
            onClick={() => setAiMessage("AI study schedule generation coming soon!")}
            className="bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-500 px-4 py-2 rounded-xl text-sm"
          >
            🤖 AI Schedule (Coming Soon)
          </button>
        </div>

        {aiMessage && (
          <div className="bg-pink-50 border border-pink-200 text-pink-600 px-5 py-3 rounded-xl mb-6 flex justify-between">
            🤖 {aiMessage}
            <button onClick={() => setAiMessage("")} className="text-pink-400 hover:text-pink-700 text-xs">✕</button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-2xl font-bold text-[#A78BFA]">{todayTasks.length}</p>
            <p className="text-purple-300 text-sm mt-1">Today</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-sky-500">{upcomingTasks.length}</p>
            <p className="text-purple-300 text-sm mt-1">Upcoming</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-500">{completedTasks.length}</p>
            <p className="text-purple-300 text-sm mt-1">Completed</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left - Create/Edit Form */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold mb-4 text-[#1E1B4B]">
                {editingTask ? "✏️ Edit Task" : "➕ New Task"}
              </h2>

              <input
                name="title"
                className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                placeholder="Task title..."
                value={form.title}
                onChange={handleChange}
              />

              <input
                name="subject"
                className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                placeholder="Subject (e.g. Math, Physics)..."
                value={form.subject}
                onChange={handleChange}
              />

              <input
                name="date"
                type="date"
                className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                value={form.date}
                onChange={handleChange}
              />

              <input
                name="time"
                type="time"
                className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                value={form.time}
                onChange={handleChange}
              />

              <select
                name="priority"
                className="w-full mb-4 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>

              <div className="flex gap-2">
                <Button onClick={handleSave} variant="primary" className="flex-1">
                  {editingTask ? "Update" : "Save Task"}
                </Button>
                {editingTask && (
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>

              {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
              {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}
            </Card>
          </div>

          {/* Right - Task List */}
          <div className="lg:col-span-2">

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {["today", "upcoming", "completed"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all
                    ${activeTab === tab
                      ? "bg-[#A78BFA] text-white"
                      : "bg-white text-purple-300 hover:text-[#1E1B4B] border border-purple-100"
                    }`}
                >
                  {tab === "today" ? `Today (${todayTasks.length})` :
                   tab === "upcoming" ? `Upcoming (${upcomingTasks.length})` :
                   `Completed (${completedTasks.length})`}
                </button>
              ))}
            </div>

            {/* Tasks */}
            {tabTasks.length === 0 && (
              <p className="text-purple-300">
                {activeTab === "today" ? "No tasks for today. Add one!" :
                 activeTab === "upcoming" ? "No upcoming tasks." :
                 "No completed tasks yet."}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {tabTasks.map(task => (
                <Card
                  key={task.id}
                  className={`flex items-start gap-4 ${task.completed ? "opacity-60" : ""}`}
                >
                  {/* Complete Toggle */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all
                      ${task.completed
                        ? "bg-green-400 border-green-400"
                        : "border-purple-200 hover:border-[#A78BFA]"
                      }`}
                  />

                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`font-semibold ${task.completed ? "line-through text-purple-300" : "text-[#1E1B4B]"}`}>
                        {task.title}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-lg border ml-2 ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-purple-400 text-sm mt-1">📚 {task.subject}</p>
                    <p className="text-purple-300 text-xs mt-1">
                      📅 {task.date} {task.time && `at ${task.time}`}
                    </p>
                  </div>

                  {/* Actions */}
                  {!task.completed && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(task)} variant="blue" className="text-xs px-3 py-1.5">
                        ✏️
                      </Button>
                      <Button onClick={() => handleDelete(task.id)} variant="danger" className="text-xs px-3 py-1.5">
                        🗑️
                      </Button>
                    </div>
                  )}

                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planner