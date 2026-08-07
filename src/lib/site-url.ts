const DEFAULT_SITE_ORIGIN = 'https://anxforever.cn'

function normalizeOrigin(value?: string | null): string | null {
	const trimmed = value?.trim()
	if (!trimmed) return null

	const withoutTrailingSlash = trimmed.replace(/\/$/, '')
	if (/^https?:\/\//i.test(withoutTrailingSlash)) {
		return withoutTrailingSlash
	}

	const protocol = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(withoutTrailingSlash) ? 'http' : 'https'
	return `${protocol}://${withoutTrailingSlash}`
}

export function getSiteOrigin(): string {
	return (
		normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
		normalizeOrigin(process.env.SITE_URL) ||
		normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
		normalizeOrigin(process.env.VERCEL_URL) ||
		DEFAULT_SITE_ORIGIN
	)
}
