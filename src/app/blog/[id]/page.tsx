import type { Metadata } from 'next'
import fs from 'node:fs/promises'
import path from 'node:path'
import BlogPostClient from './page-client'

type PageProps = {
	params: Promise<{ id?: string | string[] }>
}

type BlogConfig = {
	title?: string
	tags?: string[]
	date?: string
	summary?: string
	cover?: string
	category?: string
}

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://anxforever.cn').replace(/\/$/, '')

async function readBlogConfig(slug: string): Promise<BlogConfig | null> {
	if (!slug) return null
	const configPath = path.join(process.cwd(), 'public', 'blogs', slug, 'config.json')

	try {
		const raw = await fs.readFile(configPath, 'utf8')
		return JSON.parse(raw) as BlogConfig
	} catch {
		return null
	}
}

function normalizeSlug(value?: string | string[]): string {
	return Array.isArray(value) ? value[0] || '' : value || ''
}

function absoluteCoverUrl(cover?: string): string | undefined {
	if (!cover) return undefined
	if (/^https?:\/\//i.test(cover)) return cover
	return `${SITE_ORIGIN}${cover}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params
	const slug = normalizeSlug(id)
	const config = await readBlogConfig(slug)

	if (!slug || !config) {
		return {
			title: '文章不存在',
			description: '未找到对应文章'
		}
	}

	const title = config.title || slug
	const description = config.summary || `${title} - ${slug}`
	const keywords = [title, ...(config.tags || []), config.category || ''].filter(Boolean)
	const cover = absoluteCoverUrl(config.cover)
	const canonical = `${SITE_ORIGIN}/blog/${slug}`

	return {
		title,
		description,
		keywords,
		alternates: {
			canonical
		},
		openGraph: {
			title,
			description,
			type: 'article',
			url: canonical,
			publishedTime: config.date,
			tags: config.tags,
			images: cover ? [{ url: cover }] : undefined
		},
		twitter: {
			card: cover ? 'summary_large_image' : 'summary',
			title,
			description,
			images: cover ? [cover] : undefined
		}
	}
}

export default async function Page({ params }: PageProps) {
	const { id } = await params
	const slug = normalizeSlug(id)
	const config = await readBlogConfig(slug)

	const articleJsonLd =
		slug && config
			? {
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: config.title || slug,
					description: config.summary || '',
					datePublished: config.date,
					dateModified: config.date,
					mainEntityOfPage: `${SITE_ORIGIN}/blog/${slug}`,
					author: {
						'@type': 'Person',
						name: 'AnxForever'
					},
					publisher: {
						'@type': 'Person',
						name: 'AnxForever'
					},
					image: absoluteCoverUrl(config.cover),
					keywords: config.tags?.join(', ')
				}
			: null

	return (
		<>
			{articleJsonLd && <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />}
			<BlogPostClient slug={slug} />
		</>
	)
}
