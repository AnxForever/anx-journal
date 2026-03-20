import type { Metadata } from 'next'
import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import BlogPostClient from './page-client'
import { renderMarkdown } from '@/lib/markdown-renderer'
import type { LoadedBlog } from '@/lib/load-blog'

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

const readBlogConfig = cache(async (slug: string): Promise<BlogConfig | null> => {
	if (!slug) return null
	const configPath = path.join(process.cwd(), 'public', 'blogs', slug, 'config.json')

	try {
		const raw = await fs.readFile(configPath, 'utf8')
		return JSON.parse(raw) as BlogConfig
	} catch {
		return null
	}
})

const readBlogMarkdown = cache(async (slug: string): Promise<string | null> => {
	if (!slug) return null
	const markdownPath = path.join(process.cwd(), 'public', 'blogs', slug, 'index.md')

	try {
		return await fs.readFile(markdownPath, 'utf8')
	} catch {
		return null
	}
})

const readBlog = cache(async (slug: string): Promise<LoadedBlog | null> => {
	if (!slug) return null

	const [config, markdown] = await Promise.all([readBlogConfig(slug), readBlogMarkdown(slug)])
	if (!markdown) return null

	return {
		slug,
		config: config ?? {},
		markdown,
		cover: config?.cover
	}
})

function normalizeSlug(value?: string | string[]): string {
	return Array.isArray(value) ? value[0] || '' : value || ''
}

function absoluteCoverUrl(cover?: string): string | undefined {
	if (!cover) return undefined
	if (/^https?:\/\//i.test(cover)) return cover
	return `${SITE_ORIGIN}${cover}`
}

function stripLeadingH1WhenMatchesTitle(markdown: string, title: string): string {
	const normalizedTitle = title.trim().replace(/\s+/g, ' ')
	if (!normalizedTitle) return markdown

	const lines = markdown.split('\n')
	const match = /^#\s+(.+)$/.exec(lines[0]?.trim() ?? '')
	if (!match) return markdown

	const headingText = match[1].trim().replace(/\s+/g, ' ')
	if (headingText !== normalizedTitle) return markdown

	const rest = lines.slice(1).join('\n').replace(/^\s+/, '')
	return rest || ''
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
	const blog = await readBlog(slug)
	const title = blog?.config.title || slug
	const previewMarkdown = blog ? stripLeadingH1WhenMatchesTitle(blog.markdown, title) : ''
	const renderedArticle = previewMarkdown ? await renderMarkdown(previewMarkdown) : null

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
			<BlogPostClient key={slug} slug={slug} blog={blog} renderedHtml={renderedArticle?.html} toc={renderedArticle?.toc} />
		</>
	)
}
