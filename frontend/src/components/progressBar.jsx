function ProgressBar({ value, max = 100, color = "primary" }) {

  const colors = {
    primary: "bg-[#A78BFA]",
    pink: "bg-[#F9A8D4]",
    blue: "bg-[#BAE6FD]",
  }

  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className="w-full bg-purple-50 rounded-full h-2.5">
      <div
        className={`${colors[color]} h-2.5 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default ProgressBar