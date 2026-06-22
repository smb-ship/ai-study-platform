import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import ErrorMessage from "../components/ErrorMessage"
import Card from "../components/Card"
import Button from "../components/Button"
import SectionTitle from "../components/SectionTitle"

function Settings() {

  const navigate = useNavigate()

  const [pageLoading, setPageLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [profileMsg, setProfileMsg] = useState("")
  const [profileErr, setProfileErr] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordErr, setPasswordErr] = useState("")

  const [studyGoal, setStudyGoal] = useState("2")
  const [learningStyle, setLearningStyle] = useState("Visual")
  const [notifications, setNotifications] = useState(true)
  const [prefMsg, setPrefMsg] = useState("")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  const fetchUser = () => {
    setPageLoading(true)
    setLoadError("")
    axios.get("http://127.0.0.1:5000/api/me", { headers })
      .then(res => {
        setUser(res.data)
        setName(res.data.name)
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login")
        else setLoadError("Cannot reach the server. Please check your connection and try again.")
      })
      .finally(() => setPageLoading(false))
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleUpdateProfile = async () => {
    setProfileMsg("")
    setProfileErr("")
    try {
      const res = await axios.put(
        "http://127.0.0.1:5000/api/settings/update-profile",
        { name },
        { headers }
      )
      setProfileMsg(res.data.message)
      setUser(prev => ({ ...prev, name }))
      setTimeout(() => setProfileMsg(""), 3000)
    } catch (err) {
      setProfileErr(err.response?.data?.error || "Failed to update profile")
    }
  }

  const handleChangePassword = async () => {
    setPasswordMsg("")
    setPasswordErr("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErr("All fields are required")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setPasswordErr("New password must be at least 6 characters")
      return
    }

    try {
      const res = await axios.put(
        "http://127.0.0.1:5000/api/settings/change-password",
        { current_password: currentPassword, new_password: newPassword },
        { headers }
      )
      setPasswordMsg(res.data.message)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordMsg(""), 3000)
    } catch (err) {
      setPasswordErr(err.response?.data?.error || "Failed to change password")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("http://127.0.0.1:5000/api/settings/delete-account", { headers })
      localStorage.removeItem("token")
      navigate("/login")
    } catch (err) {
      console.log(err)
    }
  }

  const handleSavePreferences = () => {
    setPrefMsg("Preferences saved!")
    setTimeout(() => setPrefMsg(""), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <Spinner message="Loading settings..." />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F5FF]">
        <Sidebar />
        <div className="flex-1 p-10">
          <ErrorMessage message={loadError} retry={fetchUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F5FF]">
      <Sidebar />
      <div className="flex-1 p-10 max-w-4xl">

        {/* Header */}
        <SectionTitle icon="⚙️" title="Settings" subtitle="Manage your account and preferences" />

        {/* Profile Section */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[#1E1B4B] mb-5">👤 Profile</h2>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#A78BFA] flex items-center justify-center text-2xl font-bold text-white">
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="text-[#1E1B4B] font-semibold text-lg">{user?.name}</p>
              <p className="text-purple-300 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <input
              className="flex-1 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
              placeholder="Update your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleUpdateProfile} variant="primary">
              Update
            </Button>
          </div>

          {profileMsg && <p className="text-green-600 mt-3 text-sm">{profileMsg}</p>}
          {profileErr && <p className="text-red-500 mt-3 text-sm">{profileErr}</p>}
        </Card>

        {/* Change Password */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[#1E1B4B] mb-5">🔒 Change Password</h2>

          <input
            type="password"
            className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="Current password..."
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full mb-3 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="New password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full mb-4 p-3 rounded-xl bg-purple-50 text-[#1E1B4B] placeholder-purple-300 border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
            placeholder="Confirm new password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button onClick={handleChangePassword} variant="blue">
            Change Password
          </Button>

          {passwordMsg && <p className="text-green-600 mt-3 text-sm">{passwordMsg}</p>}
          {passwordErr && <p className="text-red-500 mt-3 text-sm">{passwordErr}</p>}
        </Card>

        {/* Study Preferences */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[#1E1B4B] mb-5">📚 Study Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <div>
              <label className="text-purple-400 text-sm mb-2 block">Daily Study Target (hours)</label>
              <select
                className="w-full p-3 rounded-xl bg-purple-50 text-[#1E1B4B] border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5+ hours</option>
              </select>
            </div>

            <div>
              <label className="text-purple-400 text-sm mb-2 block">Preferred Learning Style</label>
              <select
                className="w-full p-3 rounded-xl bg-purple-50 text-[#1E1B4B] border border-purple-100 focus:outline-none focus:border-[#A78BFA]"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
              >
                <option value="Visual">Visual</option>
                <option value="Reading">Reading / Writing</option>
                <option value="Practice">Practice / Doing</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

          </div>

          <Button onClick={handleSavePreferences} variant="primary">
            Save Preferences
          </Button>

          {prefMsg && <p className="text-green-600 mt-3 text-sm">{prefMsg}</p>}
        </Card>

        {/* App Preferences */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-[#1E1B4B] mb-5">🎨 App Preferences</h2>

          <div className="flex items-center justify-between py-3 border-b border-purple-100">
            <div>
              <p className="text-[#1E1B4B] font-medium">Light Mode</p>
              <p className="text-purple-300 text-sm">Pastel theme is enabled by default</p>
            </div>
            <div className="bg-[#A78BFA] text-white px-3 py-1 rounded-lg text-sm font-semibold">
              Active
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[#1E1B4B] font-medium">Study Reminders</p>
              <p className="text-purple-300 text-sm">Get notified about your study goals</p>
            </div>
            <button
              onClick={() => setNotifications(n => !n)}
              className={`w-12 h-6 rounded-full transition-all relative ${notifications ? "bg-[#A78BFA]" : "bg-purple-100"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${notifications ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100">
          <h2 className="text-lg font-semibold text-red-500 mb-5">⚠️ Danger Zone</h2>

          <div className="flex items-center justify-between py-3 border-b border-purple-100 mb-4">
            <div>
              <p className="text-[#1E1B4B] font-medium">Logout</p>
              <p className="text-purple-300 text-sm">Sign out of your account</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-[#1E1B4B] font-medium">Delete Account</p>
              <p className="text-purple-300 text-sm">Permanently delete your account and all data</p>
            </div>
            {!showDeleteConfirm ? (
              <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">
                Delete
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleDeleteAccount} variant="danger">
                  Yes, Delete
                </Button>
                <Button onClick={() => setShowDeleteConfirm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            )}
          </div>

        </Card>

      </div>
    </div>
  )
}

export default Settings