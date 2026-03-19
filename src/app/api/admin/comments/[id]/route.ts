import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { forwardInteractionsRequest } from '@/lib/server/interactions-proxy'

export const runtime = 'nodejs'

const payloadSchema = z.object({
	status: z.enum(['approved', 'pending', 'rejected'])
})

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params
	const adminToken = request.headers.get('x-admin-token') || ''
	if (!adminToken) {
		return NextResponse.json({ error: 'Missing admin token' }, { status: 401 })
	}

	const parsed = payloadSchema.safeParse(await request.json())
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
	}

	const proxied = await forwardInteractionsRequest(`/admin/comments/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: {
			'content-type': 'application/json',
			'x-admin-token': adminToken
		},
		body: JSON.stringify(parsed.data)
	})
	const data = await proxied.json().catch(() => ({}))
	return NextResponse.json(data, { status: proxied.status })
}
