import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Skeleton */}
      <section className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-orange-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-tl from-red-900/30 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge skeleton */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 animate-pulse">
            <div className="h-5 w-5 bg-white/20 rounded mr-2"></div>
            <div className="h-4 bg-white/20 rounded w-32"></div>
            <div className="h-4 w-4 bg-white/20 rounded ml-2"></div>
          </div>

          {/* Title skeleton */}
          <div className="h-16 bg-white/20 rounded-lg w-80 mx-auto mb-6 animate-pulse"></div>
          
          {/* Description skeleton */}
          <div className="space-y-3 max-w-3xl mx-auto mb-8">
            <div className="h-6 bg-white/20 rounded-lg w-full animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded-lg w-2/3 mx-auto animate-pulse"></div>
          </div>

          {/* Trust indicators skeleton */}
          <div className="flex flex-wrap justify-center gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2 animate-pulse">
                <div className="h-5 w-5 bg-white/20 rounded"></div>
                <div className="h-4 bg-white/20 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Bar Skeleton */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Form Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Fields Skeleton */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information Card Skeleton */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Selection Card Skeleton */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-56"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload Card Skeleton */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-200 to-green-300 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-52"></div>
                        <div className="h-4 bg-gray-200 rounded w-60"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                      <div className="h-40 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-xl border-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Skeleton */}
              <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-200 to-red-300 rounded-lg"></div>
                      <div className="h-6 bg-gray-200 rounded w-40"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                    </div>
                    <div className="h-14 bg-gradient-to-r from-red-200 via-red-300 to-red-200 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-12 bg-green-100 rounded-lg border"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Support Card Skeleton */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full mx-auto mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40 mx-auto mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
