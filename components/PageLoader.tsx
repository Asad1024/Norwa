'use client'

export default function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nature-green-50 flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 border-4 border-nature-green-200 border-t-nature-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-nature-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-lg font-semibold text-nature-green-800">{message}</p>
      </div>
    </div>
  )
}
