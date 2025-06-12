import { Suspense } from "react"
import Hero from "@/components/home/hero"
import FeaturedServices from "@/components/home/featured-services"
import AboutSection from "@/components/home/about-section"
import ContactCTA from "@/components/home/contact-cta"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<ServicesSkeleton />}>
        <FeaturedServices />
      </Suspense>
      <AboutSection />
      <ContactCTA />
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <Skeleton className="h-48 w-full mb-4 rounded" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
