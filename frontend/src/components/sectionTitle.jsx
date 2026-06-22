function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#1E1B4B] flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {subtitle && (
        <p className="text-purple-400 mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  )
}

export default SectionTitle