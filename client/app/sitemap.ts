import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://phulong.com' // Thay bằng domain thực của bạn
  
  // Static pages
  const staticPages = [
    '',
    '/blog',
    '/services',
    '/pricing',
    '/contact',
    '/order',
  ]

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Thêm dynamic routes cho blog posts và services
  // Bạn có thể fetch data từ API để tạo dynamic routes
  // const blogPosts = await fetch('your-api/blogs').then(res => res.json())
  // const blogRoutes = blogPosts.map((post: any) => ({
  //   url: `${baseUrl}/blog/${post.id}`,
  //   lastModified: new Date(post.updated_at),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }))

  // const services = await fetch('your-api/services').then(res => res.json())
  // const serviceRoutes = services.map((service: any) => ({
  //   url: `${baseUrl}/services/${service.id}`,
  //   lastModified: new Date(service.updated_at),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.7,
  // }))

  return [
    ...staticRoutes,
    // ...blogRoutes,
    // ...serviceRoutes,
  ]
} 