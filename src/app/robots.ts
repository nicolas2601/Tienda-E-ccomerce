import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout'],
      },
    ],
    ...(base ? { sitemap: `${base.replace(/\/$/, '')}/sitemap.xml` } : {}),
  }
}
