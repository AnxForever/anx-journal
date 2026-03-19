import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getClientIp, sanitizeSlug } from '@/lib/interactions'
import { forwardInteractionsRequest } from '@/lib/server/interactions-proxy'

export const runtime = 'nodejs'

const commentSchema = z.object({
	nickname: z.string().trim().min(1).max(80),
	content: z.string().trim().min(1).max(1200),
	email: z.string().trim().email().optional().or(z.literal('')).optional(),
	website: z.string().trim().max(255).optional().or(z.literal('')).optional()
})

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	const { slug: rawSlug } = await context.params
	const slug = sanitizeSlug(rawSlug || '')

	if (!slug) {
		return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
	}

	const proxied = await forwardInteractionsRequest(`/comments/${encodeURIComponent(slug)}`, { method: 'GET' })
	const data = await proxied.json().catch(() => ({}))
	return NextResponse.json(data, { status: proxied.status })
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
	const { slug: rawSlug } = await context.params
	const slug = sanitizeSlug(rawSlug || '')

	if (!slug) {
		return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
	}

	const parsed = commentSchema.safeParse(await request.json())
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
	}

	const proxied = await forwardInteractionsRequest(`/comments/${encodeURIComponent(slug)}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-forwarded-for': getClientIp(request)
		},
		body: JSON.stringify(parsed.data)
	})
	const data = await proxied.json().catch(() => ({}))
	return NextResponse.json(data, { status: proxied.status })
}
