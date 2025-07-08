import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-gray-100/40 to-transparent rounded-full blur-3xl"></div>
      
      {/* Header Skeleton */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-red-600/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-2/3 bg-gradient-to-tl from-gray-900/50 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 lg:px-6 max-w-6xl text-center relative z-10">
          {/* Badge skeleton */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 animate-pulse">
            <div className="h-4 w-4 bg-white/20 rounded mr-2"></div>
            <div className="h-4 bg-white/20 rounded w-32"></div>
            <div className="h-4 w-4 bg-white/20 rounded ml-2"></div>
          </div>

          {/* Title skeleton */}
          <div className="h-12 bg-white/20 rounded-lg w-80 mx-auto mb-4 animate-pulse"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="h-5 bg-white/20 rounded-lg w-full animate-pulse"></div>
            <div className="h-5 bg-white/20 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="py-6 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full max-w-4xl">
              {/* Search skeleton */}
              <div className="relative flex-1 max-w-md">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Category select skeleton */}
              <div className="w-full sm:w-44">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Sort select skeleton */}
              <div className="w-full sm:w-36">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Results counter skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-8 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid Skeleton */}
      <section className="py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-gray-200 shadow-md bg-white h-full animate-pulse rounded-lg overflow-hidden">
                {/* Image skeleton */}
                <div className="relative h-48 bg-gray-200">
                  {/* Badge skeletons */}
                  <div className="absolute top-3 left-3">
                    <div className="h-6 w-16 bg-red-300/50 rounded-md"></div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="h-6 w-20 bg-white/70 rounded-md border"></div>
                  </div>
                </div>

                <CardHeader className="p-4">
                  {/* Title skeleton */}
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-4/5"></div>
                  </div>
                  
                  {/* Meta info skeleton */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-gray-200 rounded"></div>
                        <div className="h-3 w-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-3 w-3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Button skeleton */}
                  <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
