export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
