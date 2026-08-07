let cached: { data: unknown; ts: number } | null = null
const TTL = 3600_000 // 1 hour

export async function GET() {
	if (cached && Date.now() - cached.ts < TTL) {
		return Response.json(cached.data, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		})
	}

	try {
		const res = await fetch('https://contribkit.app/api/contributions?user=AnxForever')
		if (!res.ok) throw new Error(`upstream ${res.status}`)
		const data = await res.json()
		cached = { data, ts: Date.now() }
		return Response.json(data, {
			headers: { 'Cache-Control': 'public, max-age=3600' }
		})
	} catch {
		if (cached) return Response.json(cached.data)
		return Response.json({ cells: [], total: 0, username: 'AnxForever' }, { status: 502 })
	}
}
