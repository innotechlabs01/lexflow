export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}
