import { createHash, randomUUID } from 'node:crypto'
import type { NextRequest, NextResponse } from 'next/server'

export const VISITOR_COOKIE_NAME = 'anx_journal_visitor'

export type PublicComment = {
	id: number
	nickname: string
	content: string
	website?: string | null
	createdAt: string
}

export type PublicGuestbookEntry = {
	id: number
	nickname: string
	content: string
	website?: string | null
	createdAt: string
}

export function sanitizeSlug(value: string): string {
	return value.trim().toLowerCase()
}

export function getOrCreateVisitorId(request: NextRequest): { visitorId: string; created: boolean } {
	const existing = request.cookies.get(VISITOR_COOKIE_NAME)?.value?.trim()
	if (existing) {
		return { visitorId: existing, created: false }
	}
	return { visitorId: randomUUID(), created: true }
}

export function attachVisitorCookie(response: NextResponse, visitorId: string) {
	response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		path: '/',
		maxAge: 60 * 60 * 24 * 365
	})
}

export function getClientIp(request: NextRequest): string {
	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) {
		return forwarded.split(',')[0]?.trim() || 'unknown'
	}
	return request.headers.get('x-real-ip') || 'unknown'
}

export function hashIp(ip: string): string {
	return createHash('sha256').update(ip).digest('hex')
}

export function normalizeOptionalString(value?: string | null): string | null {
	if (!value) return null
	const normalized = value.trim()
	return normalized ? normalized : null
}

export function normalizeWebsite(value?: string | null): string | null {
	const normalized = normalizeOptionalString(value)
	if (!normalized) return null
	if (/^https?:\/\//i.test(normalized)) {
		return normalized
	}
	return `https://${normalized}`
}
