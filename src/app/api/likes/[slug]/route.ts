import { NextRequest, NextResponse } from 'next/server'
import { attachVisitorCookie, getOrCreateVisitorId, sanitizeSlug } from '@/lib/interactions'
import { forwardInteractionsRequest } from '@/lib/server/interactions-proxy'

export const runtime = 'nodejs'

type LikeMethod = 'GET' | 'POST'

function createLikeResponse(data: unknown, status: number, created: boolean, visitorId: string) {
	const response = NextResponse.json(data, { status })

	if (created) {
		attachVisitorCookie(response, visitorId)
	}

	return response
}

function createUnavailableResponse(method: LikeMethod, created: boolean, visitorId: string) {
	return createLikeResponse(
		{
			liked: method === 'POST',
			count: method === 'POST' ? 1 : 0,
			unavailable: true
		},
		method === 'POST' ? 202 : 200,
		created,
		visitorId
	)
}

async function handleLikeRequest(request: NextRequest, context: { params: Promise<{ slug: string }> }, method: LikeMethod) {
	const { slug: rawSlug } = await context.params
	const slug = sanitizeSlug(rawSlug || '')

	if (!slug) {
		return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
	}

	const { visitorId, created } = getOrCreateVisitorId(request)
	try {
		const proxied = await forwardInteractionsRequest(`/likes/${encodeURIComponent(slug)}`, {
			method,
			headers: {
				'x-visitor-id': visitorId
			}
		})
		const data = await proxied.json().catch(() => ({}))
		return createLikeResponse(data, proxied.status, created, visitorId)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[likes] Interactions backend unavailable for ${slug}: ${message}`)
		return createUnavailableResponse(method, created, visitorId)
	}
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	return handleLikeRequest(request, context, 'GET')
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	return handleLikeRequest(request, context, 'POST')
}
