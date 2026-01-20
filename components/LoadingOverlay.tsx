'use client'

export default function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-nature-green-200 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-nature-green-200 border-t-nature-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-nature-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-lg font-semibold text-nature-green-800">Loading...</p>
      </div>
    </div>
  )
}
