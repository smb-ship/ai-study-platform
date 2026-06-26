import { useState, useRef, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"
import axios from "axios";
import { useState } from "react";

// ... inside your component:

const [loading, setLoading] = useState(false);
const [response, setResponse] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [mode, setMode] = useState("explain");
<select value={mode} onChange={(e) => setMode(e.target.value)}>
  <option value="explain">Explain</option>
  <option value="quiz">Quiz Me</option>
  <option value="exam_prep">Exam Prep</option>
</select>

const handleSend = async (message) => {
  setLoading(true);
  setErrorMessage("");
  setResponse("");

  try {
    const token = localStorage.getItem("token"); // adjust to however you store the JWT
const res = await axios.post(
  "/api/tutor",
  { message, mode },
  { headers: { Authorization: `Bearer ${token}` } }
);
    setResponse(res.data.answer);
  } catch (err) {
    if (err.response?.status === 429) {
      setErrorMessage(
        err.response.data.message ||
        "The AI Tutor has hit today's free usage limit. Try again in a bit."
      );
    } else if (err.response?.status === 503) {
      setErrorMessage("The AI Tutor is temporarily unavailable. Please try again shortly.");
    } else if (err.response?.status === 400) {
      setErrorMessage(err.response.data.message || "Please check your input.");
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
          <p className="text-white/80 text-sm mt-1">
            (AI responses are placeholders for now — real AI coming soon)
          </p>
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

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
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
            <Button onClick={handleSend} variant="primary" disabled={!input.trim()}>
              Send ✈️
            </Button>
          </div>

        </Card>

      </div>
    </div>
  )

export default Tutor