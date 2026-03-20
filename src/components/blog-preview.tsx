'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
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
	renderedHtml?: string
	toc?: TocItem[]
	/** Fired once markdown body has finished rendering (no opacity delay — avoids comments flash on mobile). */
	onBodyReady?: () => void
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug, renderedHtml, toc, onBodyReady }: BlogPreviewProps) {
	const markdownToRender = markdown ?? ''
	const renderedContent = useMemo(() => (renderedHtml ? renderMarkdownHtmlToReact(renderedHtml) : null), [renderedHtml])
	const markdownResult = useMarkdownRender(renderedHtml ? '' : markdownToRender)
	const content = renderedHtml ? renderedContent : markdownResult.content
	const finalToc = renderedHtml ? (toc ?? []) : markdownResult.toc
	const loading = renderedHtml ? false : markdownResult.loading
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false
	const notifiedMarkdown = useRef<string | null>(null)

	useEffect(() => {
		notifiedMarkdown.current = null
	}, [markdownToRender, renderedHtml])

	useEffect(() => {
		if (loading || !onBodyReady) return
		const currentRenderKey = renderedHtml ?? markdownToRender
		if (notifiedMarkdown.current === currentRenderKey) return
		notifiedMarkdown.current = currentRenderKey
		onBodyReady()
	}, [loading, markdownToRender, onBodyReady, renderedHtml])

	if (loading) {
		return <div className='text-secondary flex min-h-[40dvh] items-center justify-center px-4 text-sm'>渲染中...</div>
	}

	return (
		<div className='mx-auto flex w-full max-w-[1140px] min-w-0 flex-1 justify-center gap-6 px-6 pt-28 pb-12 max-sm:px-3'>
			<article className='card bg-article static flex min-w-0 flex-1 overflow-auto rounded-xl p-6 max-sm:min-h-0 max-sm:overflow-visible sm:p-8'>
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
			</article>

			<BlogSidebar cover={cover} summary={summary} toc={finalToc} slug={slug} />
		</div>
	)
}
