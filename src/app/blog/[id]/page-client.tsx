'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { CommentsSection } from '@/components/comments-section'
import { useReadArticles } from '@/hooks/use-read-articles'
import LiquidGrass from '@/components/liquid-grass'
import type { BlogConfig } from '@/app/blog/types'
import type { TocItem } from '@/lib/markdown-renderer'

type BlogViewData = {
	slug: string
	config: BlogConfig
	cover?: string
}

type BlogPostClientProps = {
	slug: string
	blog: BlogViewData | null
	renderedHtml?: string
	toc?: TocItem[]
}

export default function BlogPostClient({ slug, blog, renderedHtml, toc }: BlogPostClientProps) {
	const router = useRouter()
	const { markAsRead } = useReadArticles()

	useEffect(() => {
		if (!slug || !blog) return
		markAsRead(slug)
	}, [blog, slug, markAsRead])

	const title = useMemo(() => (blog?.config.title ? blog.config.title : slug), [blog?.config.title, slug])
	const date = useMemo(() => dayjs(blog?.config.date).format('YYYY年 M月 D日'), [blog?.config.date])
	const tags = blog?.config.tags || []

	const handleEdit = () => {
		router.push(`/write/${slug}`)
	}

	if (!slug) {
		return <div className='text-secondary flex min-h-[50dvh] items-center justify-center px-4 text-sm'>无效的链接</div>
	}

	if (!blog || blog.slug !== slug) {
		return <div className='text-secondary flex min-h-[50dvh] items-center justify-center px-4 text-sm'>文章不存在</div>
	}

	return (
		<div className='relative z-10 w-full min-w-0'>
			<BlogPreview title={title} tags={tags} date={date} summary={blog.config.summary} cover={blog.cover} slug={slug} renderedHtml={renderedHtml} toc={toc} />

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
