function Spinner({ message = "Loading..." }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F5FF]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-purple-400">{message}</p>
      </div>
    </div>
  )
}

export default Spinner