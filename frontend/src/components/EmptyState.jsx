export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-700 border border-ink-600 flex items-center justify-center mb-4">
        <Icon size={24} className="text-ink-400" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-200 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 max-w-xs mb-5">{description}</p>
      {action}
    </div>
  )
}
