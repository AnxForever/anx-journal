import 'server-only'

const DEFAULT_INTERACTIONS_PROXY_ORIGINS = ['http://api.anxforever.cn', 'http://59.110.91.219/anx-journal-api']

export function getInteractionsProxyOrigins(): string[] {
	const configured = (process.env.INTERACTIONS_PROXY_ORIGIN || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean)

	const merged = configured.length > 0 ? configured : DEFAULT_INTERACTIONS_PROXY_ORIGINS
	return Array.from(new Set(merged.map(item => item.replace(/\/$/, ''))))
}

export async function forwardInteractionsRequest(path: string, init?: RequestInit): Promise<Response> {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	let lastError: Error | null = null

	for (const origin of getInteractionsProxyOrigins()) {
		const url = `${origin}${normalizedPath}`
		try {
			const response = await fetch(url, {
				...init,
				cache: 'no-store'
			})

			if (response.ok || response.status < 500) {
				return response
			}

			lastError = new Error(`Upstream ${origin} responded with ${response.status}`)
		} catch (error: any) {
			lastError = error
		}
	}

	throw lastError || new Error('Failed to reach interactions backend')
}
