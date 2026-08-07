let cached: { data: unknown; ts: number } | null = null
const TTL = 3600_000

export async function GET() {
	if (cached && Date.now() - cached.ts < TTL) {
		return Response.json(cached.data, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		})
	}

	try {
		const res = await fetch('https://contribkit.app/api/contributions?user=AnxForever')
		if (!res.ok) throw new Error(`upstream ${res.status}`)
		const full = await res.json()
		const data = { username: full.username, total: full.total }
		cached = { data, ts: Date.now() }
		return Response.json(data, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		})
	} catch {
		if (cached) return Response.json(cached.data)
		return Response.json({ username: 'AnxForever', total: 0 }, { status: 502 })
	}
}
