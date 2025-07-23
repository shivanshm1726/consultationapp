export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Loading Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                  <div className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                      <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl rounded-lg">
                  <div className="p-6">
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}