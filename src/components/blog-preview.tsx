'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { renderMarkdown } from '@/lib/markdown-renderer'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { TocItem } from '@/lib/markdown-renderer'
import { renderMarkdownHtmlToReact } from '@/lib/markdown-html'

type BlogPreviewProps = {
	markdown?: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
	serverContent?: ReactElement | null
	toc?: TocItem[]
	footer?: ReactNode
	onBodyReady?: () => void
}

function BlogBodySkeleton() {
	const lines = [100, 94, 88, 96, 72, 100, 68, 92, 86] as const
	return (
		<div className='space-y-3 pt-2' aria-hidden>
			{lines.map((w, i) => (
				<div
					key={i}
					className='bg-secondary/15 h-3.5 max-w-full rounded-md animate-pulse'
					style={{ width: `${w}%` }}
				/>
			))}
			<div className='bg-secondary/10 mt-6 h-24 w-full rounded-xl animate-pulse' />
			<div className='bg-secondary/15 h-3.5 w-[80%] max-w-full rounded-md animate-pulse' />
			<div className='bg-secondary/15 h-3.5 w-full max-w-[92%] rounded-md animate-pulse' />
		</div>
	)
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug, serverContent, toc, footer, onBodyReady }: BlogPreviewProps) {
	const markdownToRender = markdown ?? ''
	const markdownResult = useMarkdownRender(markdownToRender)
	const content = serverContent ?? markdownResult.content
	const finalToc = serverContent ? (toc ?? []) : markdownResult.toc
	const loading = Boolean(markdownToRender) && markdownResult.loading
	const siteContent = useConfigStore(s => s.siteContent)
	const summaryInContent = siteContent.summaryInContent ?? false
	const notifiedMarkdown = useRef<string | null>(null)

	useEffect(() => {
		notifiedMarkdown.current = null
	}, [markdownToRender, serverContent])

	useEffect(() => {
		if (loading || !onBodyReady) return
		const currentRenderKey = serverContent ? 'server' : markdownToRender
		if (notifiedMarkdown.current === currentRenderKey) return
		notifiedMarkdown.current = currentRenderKey
		onBodyReady()
	}, [loading, markdownToRender, onBodyReady, serverContent])

	if (loading) {
		return <div className='text-secondary flex min-h-[40dvh] items-center justify-center px-4 text-sm'>渲染中...</div>
	}

	return (
		<div className='mx-auto flex min-h-0 w-full max-w-[1140px] min-w-0 flex-1 flex-col gap-8 overflow-x-hidden px-6 pt-28 pb-12 max-sm:px-3 lg:flex-row lg:items-start lg:justify-center lg:gap-6'>
			<article className='card bg-article static flex w-full min-w-0 flex-1 overflow-auto rounded-xl p-6 max-sm:min-h-0 max-sm:overflow-x-hidden max-sm:overflow-y-visible max-sm:[backdrop-filter:none] sm:p-8 lg:min-w-0'>
				<div className='w-full min-w-0 max-w-full'>
					<div className='break-words px-1 text-center text-xl leading-snug font-semibold sm:text-2xl'>{title}</div>

					<div className='text-secondary mt-4 flex flex-wrap items-center justify-center gap-3 px-2 text-center text-sm sm:px-8'>
						{tags.map(t => (
							<span key={t}>#{t}</span>
						))}
					</div>

					<div className='text-secondary mt-3 text-center text-sm'>{date}</div>

					{summary && summaryInContent && <div className='text-secondary mt-6 cursor-text text-center text-sm'>“{summary}”</div>}

					<div className='prose mt-6 max-w-none min-w-0 cursor-text'>
						{loading ? <BlogBodySkeleton /> : content}
					</div>
					{!loading && footer}
				</div>
			</article>

			<BlogSidebar cover={cover} summary={summary} toc={finalToc} slug={slug} />
		</div>
	)
}
