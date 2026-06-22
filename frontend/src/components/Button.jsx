function Button({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) {

  const variants = {
    primary: "bg-[#A78BFA] hover:bg-[#8B5CF6] text-white",
    pink: "bg-[#F9A8D4] hover:bg-pink-300 text-[#1E1B4B]",
    blue: "bg-[#BAE6FD] hover:bg-sky-200 text-[#1E1B4B]",
    outline: "bg-white hover:bg-purple-50 text-[#1E1B4B] border border-purple-200",
    danger: "bg-red-100 hover:bg-red-200 text-red-600",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}

export default Button