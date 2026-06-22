function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-sm border border-purple-100 ${className}`}
    >
      {children}
    </div>
  )
}

export default Card