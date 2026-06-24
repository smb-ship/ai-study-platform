import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"

function Flashcards() {

  const navigate = useNavigate()
  const [decks, setDecks] = useState([])
  const [activeDeck, setActiveDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState("list")
  const [deckTitle, setDeckTitle] = useState("")
  const [deckDesc, setDeckDesc] = useState("")
  const [cardFront, setCardFront] = useState("")
  const [cardBack, setCardBack] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiMessage, setAiMessage] = useState("")

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchDecks = async () => {
    setLoading(true)
    setLoadError("")
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL}/api/flashcards/", { headers })
      setDecks(res.data)
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

  useEffect(() => { fetchDecks() }, [])

  const fetchCards = async (deckId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/flashcards/${deckId}/cards`, { headers })
      setCards(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleCreateDeck = async () => {
    setError("")
    if (!deckTitle) { setError("Deck title is required"); return }
    try {
      await axios.post("${import.meta.env.VITE_API_URL}/api/flashcards/", { title: deckTitle, description: deckDesc }, { headers })
      setDeckTitle("")
      setDeckDesc("")
      setSuccess("Deck created!")
      fetchDecks()
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError("Failed to create deck")
    }
  }

  const handleDeleteDeck = async (deckId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/flashcards/${deckId}`, { headers })
      fetchDecks()
    } catch (err) {
      setError("Failed to delete deck")
    }
  }

  const handleAddCard = async () => {
    setError("")
    if (!cardFront || !cardBack) { setError("Front and back are required"); return }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/flashcards/${activeDeck.id}/cards`,
        { front: cardFront, back: cardBack },
        { headers }
      )
      setCardFront("")
      setCardBack("")
      setSuccess("Card added!")
      fetchCards(activeDeck.id)
      fetchDecks()
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError("Failed to add card")
    }
  }

  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/flashcards/cards/${cardId}`, { headers })
      fetchCards(activeDeck.id)
      fetchDecks()
    } catch (err) {
      setError("Failed to delete card")
    }
  }

  const handleToggleLearned = async (cardId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/flashcards/cards/${cardId}/learned`, {}, { headers })
      fetchCards(activeDeck.id)
    } catch (err) {
      console.log(err)
    }
  }

  const handleStudy = async (deck) => {
    setActiveDeck(deck)
    await fetchCards(deck.id)
    setCardIndex(0)
    setFlipped(false)
    setMode("study")
  }

  const handleManage = async (deck) => {
    setActiveDeck(deck)
    await fetchCards(deck.id)
    setMode("manage")
    setError("")
    setSuccess("")
  }

  const learnedCount = cards.filter(c => c.learned).length

  // ✅ Study Mode
  if (mode === "study" && cards.length > 0) {
    const card = cards[cardIndex]
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10 flex flex-col items-center">

          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#1E1B4B]">{activeDeck.title}</h1>
              <button
                onClick={() => { setMode("list"); setActiveDeck(null) }}
                className="text-purple-300 hover:text-[#1E1B4B] text-sm"
              >
                ✕ Exit
              </button>
            </div>

            {/* Progress */}
            <div className="flex justify-between text-sm text-purple-400 mb-2">
              <span>Card {cardIndex + 1} of {cards.length}</span>
              <span>✅ {learnedCount} learned</span>
            </div>
            <div className="w-full bg-purple-50 rounded-full h-2 mb-8">
              <div
                className="bg-[#A78BFA] h-2 rounded-full transition-all"
                style={{ width: `${((cardIndex + 1) / cards.length) * 100}%` }}
              />
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setFlipped(f => !f)}
              className="cursor-pointer bg-white border border-purple-100 shadow-sm rounded-3xl p-10 min-h-60 flex flex-col items-center justify-center text-center mb-6 hover:border-[#A78BFA] transition-all"
            >
              <p className="text-xs text-purple-300 mb-4 uppercase tracking-widest">
                {flipped ? "Answer" : "Question — click to flip"}
              </p>
              <p className="text-2xl font-semibold text-[#1E1B4B]">
                {flipped ? card.back : card.front}
              </p>
            </div>

            {/* Mark Learned */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => handleToggleLearned(card.id)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${card.learned
                    ? "bg-green-100 border-green-200 text-green-700"
                    : "bg-purple-50 border-purple-100 text-purple-400 hover:border-green-400"
                  }`}
              >
                {card.learned ? "✅ Learned" : "Mark as Learned"}
              </button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setFlipped(false) }}
                disabled={cardIndex === 0}
                variant="outline"
              >
                ← Previous
              </Button>
              <Button
                onClick={() => { setCardIndex(i => Math.min(cards.length - 1, i + 1)); setFlipped(false) }}
                disabled={cardIndex === cards.length - 1}
                variant="primary"
              >
                Next →
              </Button>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ✅ Manage Deck Mode
  if (mode === "manage" && activeDeck) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1E1B4B]">{activeDeck.title}</h1>
              <p className="text-purple-300 mt-1">{activeDeck.description}</p>
            </div>
            <button
              onClick={() => { setMode("list"); setActiveDeck(null) }}
              className="text-purple-300 hover:text-[#1E1B4B] text-sm"
            >
              ← Back to Decks
            </button>
          </div>

          {/* Add Card Form */}
          <Card className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[#1E1B4B]">➕ Add New Card</h2>

            <input
              className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
              placeholder="Front (question or term)..."
              value={cardFront}
              onChange={(e) => setCardFront(e.target.value)}
            />
            <textarea
              className="w-full mb-4 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA] h-24 resize-none"
              placeholder="Back (answer or explanation)..."
              value={cardBack}
              onChange={(e) => setCardBack(e.target.value)}
            />
            <Button onClick={handleAddCard} variant="primary">
              Add Card
            </Button>
            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
            {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}
          </Card>

          {/* Cards List */}
          <h2 className="text-lg font-semibold mb-4 text-[#1E1B4B]">
            Cards ({cards.length})
          </h2>

          {cards.length === 0 && (
            <p className="text-purple-300">No cards yet. Add your first card above!</p>
          )}

          <div className="flex flex-col gap-3">
            {cards.map((card, i) => (
              <Card key={card.id} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs text-purple-300 mb-1">Card {i + 1}</p>
                  <p className="text-[#1E1B4B] font-semibold">{card.front}</p>
                  <p className="text-[#6B7280] text-sm mt-1">{card.back}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {card.learned && (
                    <span className="text-green-600 text-xs">✅ Learned</span>
                  )}
                  <Button onClick={() => handleDeleteCard(card.id)} variant="danger" className="text-xs px-3 py-1.5">
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </div>
    )
  }

  // ✅ Deck List Screen
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <Spinner message="Loading flashcards..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <ErrorMessage message={loadError} retry={fetchDecks} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10">

        <div className="mb-8 flex justify-between items-center">
          <SectionTitle icon="🃏" title="Flashcards" subtitle="Create and study your flashcard decks" />
          <button
            onClick={() => setAiMessage("AI flashcard generation coming soon!")}
            className="bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-500 px-4 py-2 rounded-xl text-sm"
          >
            🤖 Generate from Notes (AI — Coming Soon)
          </button>
        </div>

        {aiMessage && (
          <div className="bg-pink-50 border border-pink-200 text-pink-600 px-5 py-3 rounded-xl mb-6 flex justify-between">
            🤖 {aiMessage}
            <button onClick={() => setAiMessage("")} className="ml-4 text-pink-400 hover:text-pink-700 text-xs">✕</button>
          </div>
        )}

        {/* Create Deck Form */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[#1E1B4B]">➕ New Deck</h2>
          <input
            className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="Deck title (e.g. Physics, Biology)..."
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
          />
          <input
            className="w-full mb-4 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="Description (optional)..."
            value={deckDesc}
            onChange={(e) => setDeckDesc(e.target.value)}
          />
          <Button onClick={handleCreateDeck} variant="primary">
            Create Deck
          </Button>
          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
          {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}
        </Card>

        {/* Deck Cards */}
        {decks.length === 0 && (
          <p className="text-purple-300">No decks yet. Create your first deck above!</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1E1B4B]">{deck.title}</h2>
                {deck.description && (
                  <p className="text-purple-300 text-sm mt-1">{deck.description}</p>
                )}
                <p className="text-purple-300 text-sm mt-2">{deck.card_count} cards</p>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={() => handleStudy(deck)}
                  disabled={deck.card_count === 0}
                  variant="primary"
                  className="flex-1"
                >
                  📖 Study
                </Button>
                <Button onClick={() => handleManage(deck)} variant="outline" className="flex-1">
                  ✏️ Manage
                </Button>
                <Button onClick={() => handleDeleteDeck(deck.id)} variant="danger" className="px-3">
                  🗑️
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Flashcards