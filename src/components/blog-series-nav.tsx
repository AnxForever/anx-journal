import Link from 'next/link'
import { ArrowLeft, ArrowRight, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type SeriesItem = {
	slug: string
	kicker: string
	title: string
}

const SERIES_TITLE = 'Codex 零基础教程'

const handbookSeries: SeriesItem[] = [
	{
		slug: 'ai-tool-handbook-codex',
		kicker: '第一章',
		title: '下载 Codex 客户端'
	},
	{
		slug: 'ai-tool-handbook-codex-account',
		kicker: '第二章',
		title: '注册 ChatGPT 账号'
	},
	{
		slug: 'ai-tool-handbook-codex-network',
		kicker: '第三章',
		title: 'API Key 与网络配置'
	},
	{
		slug: 'ai-tool-handbook-claude-code',
		kicker: '附',
		title: 'Claude Code 入门'
	},
	{
		slug: 'ai-tool-handbook-mcp',
		kicker: '附',
		title: 'MCP 配置'
	},
	{
		slug: 'ai-tool-handbook-skills',
		kicker: '附',
		title: 'Skills 使用'
	},
	{
		slug: 'ai-tool-handbook-deploy-cn',
		kicker: '附',
		title: '部署方案'
	}
]

function ChapterLink({ item, direction, className }: { item: SeriesItem; direction: 'prev' | 'next' | 'index'; className?: string }) {
	const isPrev = direction === 'prev'
	const isIndex = direction === 'index'
	const label = isIndex ? '回到目录' : isPrev ? '上一章' : '下一章'
	const Icon = isIndex ? List : isPrev ? ArrowLeft : ArrowRight

	return (
		<Link
			href={`/blog/${item.slug}`}
			className={cn(
				'group hover:border-brand/40 flex min-h-20 min-w-0 items-center gap-3 rounded-xl border bg-white/55 px-4 py-3 transition-colors hover:bg-white/75',
				isPrev ? 'justify-start' : 'justify-between',
				className
			)}>
			{isPrev && <Icon className='text-secondary group-hover:text-brand h-4 w-4 shrink-0 transition-colors' />}
			<div className={cn('min-w-0', !isPrev && 'text-right')}>
				<div className='text-secondary text-xs'>{label}</div>
				<div className='mt-1 truncate text-sm font-medium'>
					{item.kicker}：{item.title}
				</div>
			</div>
			{!isPrev && <Icon className='text-secondary group-hover:text-brand h-4 w-4 shrink-0 transition-colors' />}
		</Link>
	)
}

export function BlogSeriesNav({ slug }: { slug: string }) {
	const currentIndex = handbookSeries.findIndex(item => item.slug === slug)
	if (currentIndex < 0) return null

	const current = handbookSeries[currentIndex]
	const previous = currentIndex > 0 ? handbookSeries[currentIndex - 1] : null
	const next = currentIndex < handbookSeries.length - 1 ? handbookSeries[currentIndex + 1] : null

	if (!next && !previous) return null

	return (
		<nav className='mt-12 border-t pt-6' aria-label='手册章节导航'>
			<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
				<div className='text-secondary text-xs'>{SERIES_TITLE}</div>
				<div className='text-secondary text-xs'>
					{currentIndex + 1}/{handbookSeries.length} · {current.kicker}
				</div>
			</div>
			<div className='grid gap-3 sm:grid-cols-2'>
				{previous ? <ChapterLink item={previous} direction='prev' /> : null}
				{next ? (
					<ChapterLink item={next} direction='next' className={previous ? undefined : 'sm:col-start-2'} />
				) : null}
			</div>
			<ol className='mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
				{handbookSeries.map((item, index) => {
					const isCurrent = item.slug === slug

					return (
						<li key={item.slug} className='min-w-0'>
							<Link
								href={`/blog/${item.slug}`}
								aria-current={isCurrent ? 'page' : undefined}
								className={cn(
									'flex min-h-11 min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
									isCurrent ? 'border-brand/50 text-brand bg-white/80' : 'hover:border-brand/35 bg-white/45 hover:bg-white/70'
								)}>
								<span className='text-secondary shrink-0 text-xs tabular-nums'>{String(index + 1).padStart(2, '0')}</span>
								<span className='min-w-0 truncate'>
									{item.kicker}：{item.title}
								</span>
							</Link>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
