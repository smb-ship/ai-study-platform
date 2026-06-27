import { useState, useRef, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"
import axios from "axios"

function Tutor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [mode, setMode] = useState("explain")
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (message) => {
    if (!message.trim()) return

    setMessages((prev) => [...prev, { role: "user", text: message }])
    setInput("")
    setLoading(true)
    setErrorMessage("")

    try {
      const token = localStorage.getItem("token")

      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/tutor`,
  {
          message: message,
          mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }])
    } catch (err) {
      console.log(err)

      if (err.response?.status === 429) {
        setErrorMessage(
          err.response.data?.message || "AI Tutor free quota finished. Try later."
        )
      } else if (err.response?.status === 503) {
        setErrorMessage("AI Tutor is temporarily unavailable. Please try again shortly.")
      } else if (err.response?.status === 400) {
        setErrorMessage(err.response.data?.message || "Please check your input.")
      } else {
        setErrorMessage("AI Tutor failed. Check backend.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10 flex flex-col max-h-screen">

        {/* Header */}
        <SectionTitle icon="🤖" title="AI Tutor" subtitle="Your personal study companion" />

        {/* Welcome Card */}
        <Card className="mb-6 bg-gradient-to-br from-[#A78BFA] to-[#F9A8D4] border-none">
          <p className="text-white font-semibold">
            💡 Ask me to explain concepts, solve problems, or quiz you on any topic!
          </p>

          <div className="mt-3 flex gap-2">
            {["explain", "quiz", "exam_prep"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition
                  ${mode === m
                    ? "bg-white text-[#A78BFA]"
                    : "bg-white/30 text-white"
                  }`}
              >
                {m === "explain" ? "Explain" : m === "quiz" ? "Quiz Me" : "Exam Prep"}
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="flex-1 flex flex-col overflow-hidden p-0">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            {messages.length === 0 && (
              <p className="text-purple-300 text-center mt-10">
                No messages yet. Say hello! 👋
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-5 py-3 rounded-2xl text-sm
                    ${msg.role === "user"
                      ? "bg-[#A78BFA] text-white"
                      : "bg-purple-50 text-[#1E1B4B]"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-purple-50 text-purple-300 px-5 py-3 rounded-2xl text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  </span>
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="text-red-500 text-sm text-center">
                {errorMessage}
              </p>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-100 p-4 flex gap-3">
            <input
              className="flex-1 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
              placeholder="Ask me anything about your studies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={() => handleSend(input)} variant="primary" disabled={!input.trim()}>
              Send ✈️
            </Button>
          </div>

        </Card>

      </div>
    </div>
  )
}

export default Tutor