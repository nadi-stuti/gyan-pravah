export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8B7FC8]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
        <p className="mt-4 text-white text-lg font-semibold">Loading topics...</p>
      </div>
    </div>
  )
}
