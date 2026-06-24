import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"

function Notes() {

  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem("token")

  const headers = {
    Authorization: `Bearer ${token}`
  }

  // ✅ Load all notes
  const [loadError, setLoadError] = useState("")

  const fetchNotes = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/`, { headers })
      setNotes(res.data)
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

  useEffect(() => {
    fetchNotes()
  }, [])

  // ✅ Create or update note
  const handleSave = async () => {
    setError("")
    setSuccess("")

    if (!title || !content) {
      setError("Title and content are required")
      return
    }

    try {
      if (editingNote) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/notes/${editingNote.id}`,
          { title, content },
          { headers }
        )
        setSuccess("Note updated!")
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/notes/`,
          { title, content },
          { headers }
        )
        setSuccess("Note created!")
      }

      setTitle("")
      setContent("")
      setEditingNote(null)
      fetchNotes()

    } catch (err) {
      setError("Failed to save note")
    }
  }

  // ✅ Delete note
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
        { headers }
      )
      fetchNotes()
    } catch (err) {
      console.log(err)
      setError("Unable to delete note. Please check your connection.")
    }
  }

  // ✅ Start editing
  const handleEdit = (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setError("")
    setSuccess("")
  }

  // ✅ Cancel editing
  const handleCancel = () => {
    setEditingNote(null)
    setTitle("")
    setContent("")
    setError("")
  }

  // ✅ AI buttons - coming soon
  const handleAiFeature = (feature) => {
    setAiMessage(`"${feature}" is an AI feature coming soon!`)
    setTimeout(() => setAiMessage(""), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <Spinner message="Loading notes..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <ErrorMessage message={loadError} retry={fetchNotes} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">

      <Sidebar />

      <div className="flex-1 p-10">

        {/* Header */}
        <SectionTitle icon="📝" title="Notes" subtitle="Create and manage your study notes" />

        {/* Create / Edit Form */}
        <Card className="mb-8">

          <h2 className="text-lg font-semibold mb-4 text-[#1E1B4B]">
            {editingNote ? "✏️ Edit Note" : "➕ New Note"}
          </h2>

          <input
            className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full mb-4 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA] h-32 resize-none"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex gap-3">
            <Button onClick={handleSave} variant="primary">
              {editingNote ? "Update Note" : "Save Note"}
            </Button>

            {editingNote && (
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
          </div>

          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}

        </Card>

        {/* AI Coming Soon Message */}
        {aiMessage && (
          <div className="bg-pink-50 border border-pink-200 text-pink-600 px-5 py-3 rounded-xl mb-6">
            🤖 {aiMessage}
          </div>
        )}

        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.length === 0 && (
            <p className="text-purple-300">No notes yet. Create your first one above!</p>
          )}

          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col gap-4">

              {/* Note Header */}
              <div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">{note.title}</h3>
                <p className="text-purple-300 text-xs mt-1">{note.created_at}</p>
              </div>

              {/* Note Content */}
              <p className="text-[#6B7280] text-sm flex-1 whitespace-pre-wrap">
                {note.content}
              </p>

              {/* AI Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleAiFeature("Summarize with AI")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-400 text-xs px-3 py-1.5 rounded-lg border border-purple-100"
                >
                  🤖 Summarize
                </button>
                <button
                  onClick={() => handleAiFeature("Generate Flashcards")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-400 text-xs px-3 py-1.5 rounded-lg border border-purple-100"
                >
                  🃏 Flashcards
                </button>
                <button
                  onClick={() => handleAiFeature("Generate Quiz")}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-400 text-xs px-3 py-1.5 rounded-lg border border-purple-100"
                >
                  🧠 Quiz
                </button>
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(note)} variant="blue" className="flex-1">
                  ✏️ Edit
                </Button>
                <Button onClick={() => handleDelete(note.id)} variant="danger" className="flex-1">
                  🗑️ Delete
                </Button>
              </div>

            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Notes