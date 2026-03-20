'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { CommentsSection } from '@/components/comments-section'
import { loadBlog, type LoadedBlog } from '@/lib/load-blog'
import { useReadArticles } from '@/hooks/use-read-articles'
import LiquidGrass from '@/components/liquid-grass'

/** Drop first-line H1 when it duplicates the card title (page already renders title). */
function stripLeadingH1WhenMatchesTitle(markdown: string, title: string): string {
	const t = title.trim().replace(/\s+/g, ' ')
	if (!t) return markdown
	const lines = markdown.split('\n')
	const m = /^#\s+(.+)$/.exec(lines[0]?.trim() ?? '')
	if (!m) return markdown
	const h1 = m[1].trim().replace(/\s+/g, ' ')
	if (h1 !== t) return markdown
	const rest = lines.slice(1).join('\n').replace(/^\s+/, '')
	return rest || ''
}

export default function BlogPostClient({ slug }: { slug: string }) {
	const router = useRouter()
	const { markAsRead } = useReadArticles()

	const [blog, setBlog] = useState<LoadedBlog | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false
		async function run() {
			if (!slug) return
			try {
				setLoading(true)
				setError(null)
				setBlog(null)
				const blogData = await loadBlog(slug)

				if (!cancelled) {
					setBlog(blogData)
					setError(null)
					markAsRead(slug)
				}
			} catch (e: any) {
				if (!cancelled) {
					setError(e?.message || '加载失败')
					setBlog(null)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		run()
		return () => {
			cancelled = true
		}
	}, [slug, markAsRead])

	const title = useMemo(() => (blog?.config.title ? blog.config.title : slug), [blog?.config.title, slug])
	const date = useMemo(() => dayjs(blog?.config.date).format('YYYY年 M月 D日'), [blog?.config.date])
	const tags = blog?.config.tags || []

	const previewMarkdown = useMemo(() => {
		if (!blog) return ''
		const t = blog.config.title || slug
		return stripLeadingH1WhenMatchesTitle(blog.markdown, t)
	}, [blog, slug])

	const coverUrl = useMemo(() => {
		const c = blog?.cover
		if (!c) return undefined
		if (/^https?:\/\//i.test(c)) return c
		const base = typeof window !== 'undefined' ? window.location.origin : ''
		const path = c.startsWith('/') ? c : `/${c}`
		return base ? `${base}${path}` : path
	}, [blog?.cover])

	const handleEdit = () => {
		router.push(`/write/${slug}`)
	}

	if (!slug) {
		return <div className='text-secondary flex min-h-[50dvh] items-center justify-center px-4 text-sm'>无效的链接</div>
	}

	if (loading) {
		return <div className='text-secondary flex min-h-[50dvh] items-center justify-center px-4 text-sm'>加载中...</div>
	}

	if (error) {
		return <div className='flex min-h-[50dvh] items-center justify-center px-4 text-sm text-red-500'>{error}</div>
	}

	if (!blog || blog.slug !== slug) {
		return <div className='text-secondary flex min-h-[50dvh] items-center justify-center px-4 text-sm'>文章不存在</div>
	}

	return (
		<div className='relative z-10 w-full min-w-0'>
			<BlogPreview
				markdown={previewMarkdown}
				title={title}
				tags={tags}
				date={date}
				summary={blog.config.summary}
				cover={coverUrl}
				slug={slug}
			/>

			<CommentsSection slug={slug} />

			<motion.button
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={handleEdit}
				className='absolute top-4 right-6 rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 max-sm:hidden'>
				编辑
			</motion.button>

			{slug === 'liquid-grass' && <LiquidGrass />}
		</div>
	)
}
