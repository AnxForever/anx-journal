import { NextRequest, NextResponse } from 'next/server'
import { forwardInteractionsRequest } from '@/lib/server/interactions-proxy'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
	const status = request.nextUrl.searchParams.get('status') || 'pending'
	const adminToken = request.headers.get('x-admin-token') || ''
	if (!adminToken) {
		return NextResponse.json({ error: 'Missing admin token' }, { status: 401 })
	}

	const proxied = await forwardInteractionsRequest(`/admin/guestbook?status=${encodeURIComponent(status)}`, {
		method: 'GET',
		headers: {
			'x-admin-token': adminToken
		}
	})
	const data = await proxied.json().catch(() => ({}))
	return NextResponse.json(data, { status: proxied.status })
}
