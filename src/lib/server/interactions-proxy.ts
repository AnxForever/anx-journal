import 'server-only'

const DEFAULT_INTERACTIONS_PROXY_ORIGIN = 'http://59.110.91.219/anx-journal-api'

export function getInteractionsProxyOrigin(): string {
	return (process.env.INTERACTIONS_PROXY_ORIGIN || DEFAULT_INTERACTIONS_PROXY_ORIGIN).replace(/\/$/, '')
}

export async function forwardInteractionsRequest(path: string, init?: RequestInit): Promise<Response> {
	const url = `${getInteractionsProxyOrigin()}${path.startsWith('/') ? path : `/${path}`}`
	return fetch(url, {
		...init,
		cache: 'no-store'
	})
}
