import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Grid3X3, List } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header Skeleton */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-orange-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-red-900/30 to-transparent rounded-full blur-3xl"></div>
        
        {/* Floating elements skeleton */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge skeleton */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-lg shadow-xl mb-8 animate-pulse">
            <div className="h-5 w-5 bg-white/20 rounded mr-2"></div>
            <div className="h-4 bg-white/20 rounded w-48"></div>
            <div className="h-5 w-5 bg-white/20 rounded ml-2"></div>
          </div>

          {/* Title skeleton */}
          <div className="space-y-4 mb-6">
            <div className="h-12 lg:h-16 bg-white/20 rounded-lg w-80 mx-auto animate-pulse"></div>
            <div className="w-32 h-1.5 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 mx-auto rounded-full animate-pulse"></div>
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="h-6 bg-white/20 rounded-lg w-full animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Filters Skeleton */}
      <section className="py-8 bg-white border-b border-gray-100 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search skeleton */}
              <div className="relative flex-1 max-w-md">
                <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
              </div>

              {/* Category select skeleton */}
              <div className="w-full sm:w-56">
                <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
              </div>

              {/* Featured select skeleton */}
              <div className="w-full sm:w-48">
                <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle Skeleton */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="rounded-md opacity-50">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-md opacity-50">
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Results Counter Skeleton */}
              <div className="h-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl w-32 animate-pulse border border-blue-200"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Grid Skeleton */}
      <section className="py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-50/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm h-full animate-pulse">
                {/* Image skeleton */}
                <div className="relative h-64 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-t-xl">
                  {/* Badge skeletons */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="h-6 w-16 bg-red-300/50 rounded-full"></div>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <div className="h-6 w-20 bg-white/70 rounded-full border"></div>
                  </div>
                </div>

                <CardHeader className="p-6">
                  {/* Title skeleton */}
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 mb-3"></div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-2/3"></div>
                  </div>
                  
                  {/* Price and rating skeleton */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                      <div className="h-8 bg-gradient-to-r from-red-200 to-orange-200 rounded-lg w-24"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, starI) => (
                        <div key={starI} className="h-4 w-4 bg-yellow-200 rounded"></div>
                      ))}
                      <div className="h-4 w-8 bg-gray-200 rounded ml-2"></div>
                    </div>
                  </div>

                  {/* Feature highlights skeleton */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-blue-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-green-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="p-6 pt-0">
                  {/* Button skeleton */}
                  <div className="h-12 bg-gradient-to-r from-red-200 via-red-300 to-red-200 rounded-lg w-full shadow-lg"></div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex justify-center items-center space-x-2">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  )
}
