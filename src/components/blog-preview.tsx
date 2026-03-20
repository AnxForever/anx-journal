'use client'

import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug }: BlogPreviewProps) {
	const { maxSM: isMobile } = useSize()
	const { content, toc, loading } = useMarkdownRender(markdown)
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false

	if (loading) {
		return <div className='text-secondary flex min-h-[40dvh] items-center justify-center px-4 text-sm'>渲染中...</div>
	}

	return (
		<div className='mx-auto flex w-full min-w-0 max-w-[1140px] flex-1 justify-center gap-6 px-6 pt-28 pb-12 max-sm:px-3'>
			<motion.article
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: INIT_DELAY }}
				className='card bg-article static max-sm:min-h-0 flex min-w-0 flex-1 overflow-auto rounded-xl p-6 max-sm:overflow-visible sm:p-8'>
				<div className='min-w-0'>
					<div className='text-center text-2xl font-semibold'>{title}</div>

					<div className='text-secondary mt-4 flex flex-wrap items-center justify-center gap-3 px-2 text-center text-sm sm:px-8'>
						{tags.map(t => (
							<span key={t}>#{t}</span>
						))}
					</div>

					<div className='text-secondary mt-3 text-center text-sm'>{date}</div>

					{summary && summaryInContent && <div className='text-secondary mt-6 cursor-text text-center text-sm'>“{summary}”</div>}

					<div className='prose mt-6 max-w-none min-w-0 cursor-text'>{content}</div>
				</div>
			</motion.article>

			{!isMobile && <BlogSidebar cover={cover} summary={summary} toc={toc} slug={slug} />}
		</div>
	)
}
