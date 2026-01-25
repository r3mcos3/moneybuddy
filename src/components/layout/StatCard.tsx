interface StatCardProps {
  title: string
  emoji: string
  description: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  onClick?: () => void
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
}

export function StatCard({ title, emoji, description, color, onClick }: StatCardProps) {
  const bgColor = colorClasses[color]

  return (
    <div className={`${bgColor.split(' ').slice(0, 2).join(' ')} border ${bgColor.split(' ').slice(2, 4).join(' ')} rounded-lg p-6`}>
      <h3 className="text-xl font-semibold mb-2">
        {emoji} {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
      {onClick && (
        <button
          onClick={onClick}
          className={`mt-4 ${bgColor.split(' ').slice(4).join(' ')} font-semibold hover:underline`}
        >
          View {title} →
        </button>
      )}
    </div>
  )
}
