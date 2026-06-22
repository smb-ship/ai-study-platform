import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"

function Quiz() {

  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [result, setResult] = useState(null)
  const [seeded, setSeeded] = useState(false)

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchQuizzes = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/quiz/", { headers })
      setQuizzes(res.data)
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

  useEffect(() => { fetchQuizzes() }, [])

  const handleSeed = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/quiz/seed", {}, { headers })
      setSeeded(true)
      fetchQuizzes()
    } catch (err) {
      console.log(err)
    }
  }

  const handleStartQuiz = async (quizId) => {
    setLoading(true)
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/quiz/${quizId}`, { headers })
      setActiveQuiz(res.data)
      setQuestions(res.data.questions)
      setCurrentIndex(0)
      setAnswers({})
      setResult(null)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/quiz/${activeQuiz.id}/submit`,
        { answers },
        { headers }
      )
      setResult(res.data)
      fetchQuizzes()
    } catch (err) {
      console.log(err)
    }
  }

  const currentQuestion = questions[currentIndex]
  const difficultyColor = {
    "Easy": "text-green-500 bg-green-50",
    "Medium": "text-amber-500 bg-amber-50",
    "Hard": "text-red-500 bg-red-50"
  }

  // ✅ Results Screen
  if (result) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <SectionTitle icon="🎉" title="Quiz Results" subtitle={activeQuiz.title} />

          {/* Score Card */}
          <Card className="mb-8 text-center bg-gradient-to-br from-[#A78BFA] to-[#F9A8D4] border-none">
            <p className="text-6xl font-bold text-white mb-2">{result.percentage}%</p>
            <p className="text-xl text-white/90">
              You got <span className="font-bold">{result.score}</span> out of <span className="font-bold">{result.total}</span> correct
            </p>
          </Card>

          {/* Answer Details */}
          <div className="flex flex-col gap-4 mb-8">
            {result.details.map((item, i) => (
              <Card
                key={i}
                className={item.is_correct ? "border-green-200" : "border-red-200"}
              >
                <p className="font-semibold mb-3 text-[#1E1B4B]">
                  {i + 1}. {item.question_text}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {Object.entries(item.options).map(([key, val]) => (
                    <div
                      key={key}
                      className={`px-4 py-2 rounded-xl text-sm
                        ${key === item.correct_answer ? "bg-green-100 text-green-700" :
                          key === item.your_answer && !item.is_correct ? "bg-red-100 text-red-700" :
                          "bg-purple-50 text-[#6B7280]"}`}
                    >
                      <span className="font-bold">{key}.</span> {val}
                    </div>
                  ))}
                </div>
                <p className="text-sm">
                  {item.is_correct
                    ? <span className="text-green-600">✅ Correct!</span>
                    : <span className="text-red-500">❌ Wrong — correct answer was <strong>{item.correct_answer}</strong></span>
                  }
                </p>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => { setResult(null); setActiveQuiz(null) }}
            variant="primary"
          >
            ← Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  // ✅ Taking Quiz Screen
  if (activeQuiz && currentQuestion) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10 max-w-3xl">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1E1B4B]">{activeQuiz.title}</h1>
            <p className="text-purple-400 mt-1">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-purple-50 rounded-full h-2 mb-8">
            <div
              className="bg-[#A78BFA] h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <Card className="mb-6">
            <p className="text-xl font-semibold mb-6 text-[#1E1B4B]">{currentQuestion.question_text}</p>

            <div className="flex flex-col gap-3">
              {["A", "B", "C", "D"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`text-left px-5 py-4 rounded-xl border transition-all
                    ${answers[currentQuestion.id] === option
                      ? "bg-[#A78BFA] border-[#A78BFA] text-white"
                      : "bg-purple-50 border-purple-100 text-[#1E1B4B] hover:border-[#A78BFA]"
                    }`}
                >
                  <span className="font-bold mr-3">{option}.</span>
                  {currentQuestion[`option_${option.toLowerCase()}`]}
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              variant="outline"
            >
              ← Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex(i => i + 1)}
                disabled={!answers[currentQuestion.id]}
                variant="primary"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                variant="blue"
              >
                Submit Quiz ✓
              </Button>
            )}
          </div>

          <p className="text-purple-300 text-sm mt-4 text-center">
            {Object.keys(answers).length} of {questions.length} questions answered
          </p>

        </div>
      </div>
    )
  }

  // ✅ Quiz List Screen
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <Spinner message="Loading quizzes..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <ErrorMessage message={loadError} retry={fetchQuizzes} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10">

        <div className="mb-8 flex justify-between items-center">
          <SectionTitle icon="🧠" title="Quiz" subtitle="Test your knowledge" />

          <button
            onClick={() => setSeeded(s => s)}
            className="bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-500 px-4 py-2 rounded-xl text-sm"
          >
            🤖 Generate from Notes (AI — Coming Soon)
          </button>
        </div>

        {/* Seed Button - shown when no quizzes */}
        {quizzes.length === 0 && (
          <Card className="text-center mb-8">
            <p className="text-purple-300 mb-4">No quizzes yet. Load sample quizzes to get started!</p>
            <Button onClick={handleSeed} variant="primary">
              Load Sample Quizzes
            </Button>
            {seeded && <p className="text-green-600 mt-3">✅ Sample quizzes loaded!</p>}
          </Card>
        )}

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1E1B4B] mb-1">{quiz.title}</h2>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${difficultyColor[quiz.difficulty]}`}>
                  {quiz.difficulty}
                </span>
                <p className="text-purple-300 text-sm mt-2">
                  {quiz.question_count} questions
                </p>
              </div>

              {quiz.best_score && (
                <div className="bg-purple-50 rounded-xl px-4 py-2 text-sm">
                  <p className="text-purple-400">Best Score</p>
                  <p className="text-[#A78BFA] font-bold text-lg">
                    {quiz.best_score.percentage}%
                  </p>
                </div>
              )}

              <Button onClick={() => handleStartQuiz(quiz.id)} variant="primary" className="mt-auto">
                {quiz.best_score ? "Retake Quiz" : "Start Quiz"}
              </Button>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Quiz