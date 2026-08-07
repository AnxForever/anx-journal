'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ANIMATION_DELAY, INIT_DELAY } from '@/consts'
import LikeButton from '@/components/like-button'
import { BlogToc } from '@/components/blog-toc'
import { ScrollTopButton } from '@/components/scroll-top-button'
import { useConfigStore } from '@/app/(home)/stores/config-store'

type TocItem = {
	id: string
	text: string
	level: number
}

type BlogSidebarProps = {
	cover?: string
	summary?: string
	toc: TocItem[]
	slug?: string
}

export function BlogSidebar({ cover, summary, toc, slug }: BlogSidebarProps) {
	const siteContent = useConfigStore(s => s.siteContent)
	const summaryInContent = siteContent.summaryInContent ?? false

	return (
		<div className='hidden w-full flex-col items-start gap-4 self-start max-lg:relative max-lg:top-auto sm:flex lg:sticky lg:top-6 lg:w-[200px] lg:shrink-0'>
			{cover && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.18, ease: 'easeOut' }}
					className='bg-card w-full rounded-xl border p-3'>
					<div className='relative aspect-[5/3] w-full overflow-hidden rounded-xl border'>
						<Image src={cover} alt='cover' fill className='object-cover' unoptimized priority />
					</div>
				</motion.div>
			)}

			{summary && !summaryInContent && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 2 }}
					className='bg-card w-full rounded-xl border p-3 text-sm'>
					<h2 className='text-secondary mb-2 font-medium'>摘要</h2>
					<div className='text-secondary scrollbar-none max-h-[240px] cursor-text overflow-auto'>{summary}</div>
				</motion.div>
			)}

			<BlogToc toc={toc} delay={INIT_DELAY + ANIMATION_DELAY * 3} />

			<LikeButton slug={slug} delay={(INIT_DELAY + ANIMATION_DELAY * 4) * 1000} />

			<ScrollTopButton delay={INIT_DELAY + ANIMATION_DELAY * 5} />
		</div>
	)
}
