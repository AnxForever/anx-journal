import { NextRequest, NextResponse } from 'next/server'
import { attachVisitorCookie, getOrCreateVisitorId, sanitizeSlug } from '@/lib/interactions'
import { forwardInteractionsRequest } from '@/lib/server/interactions-proxy'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	const { slug: rawSlug } = await context.params
	const slug = sanitizeSlug(rawSlug || '')

	if (!slug) {
		return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
	}

	const { visitorId, created } = getOrCreateVisitorId(request)
	const proxied = await forwardInteractionsRequest(`/likes/${encodeURIComponent(slug)}`, {
		method: 'GET',
		headers: {
			'x-visitor-id': visitorId
		}
	})
	const data = await proxied.json().catch(() => ({}))
	const response = NextResponse.json(data, { status: proxied.status })

	if (created) {
		attachVisitorCookie(response, visitorId)
	}

	return response
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	const { slug: rawSlug } = await context.params
	const slug = sanitizeSlug(rawSlug || '')

	if (!slug) {
		return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
	}

	const { visitorId, created } = getOrCreateVisitorId(request)
	const proxied = await forwardInteractionsRequest(`/likes/${encodeURIComponent(slug)}`, {
		method: 'POST',
		headers: {
			'x-visitor-id': visitorId
		}
	})
	const data = await proxied.json().catch(() => ({}))
	const response = NextResponse.json(data, { status: proxied.status })

	if (created) {
		attachVisitorCookie(response, visitorId)
	}

	return response
}
