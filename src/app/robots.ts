import type { MetadataRoute } from 'next'
import { getSiteOrigin } from '@/lib/site-url'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getSiteOrigin()

	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/api/', '/moderation', '/write', '/write/']
		},
		sitemap: `${baseUrl}/sitemap.xml`
	}
}
