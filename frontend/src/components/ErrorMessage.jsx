function ErrorMessage({ message, retry }) {

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8 text-center">

      <h2 className="text-red-500 text-xl font-bold mb-3">
        Something went wrong
      </h2>

      <p className="text-purple-300 mb-5">
        {message}
      </p>

      {retry && (
        <button
          onClick={retry}
          className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-white px-5 py-2 rounded-xl font-semibold transition-all"
        >
          Retry
        </button>
      )}

    </div>
  )
}

export default ErrorMessage