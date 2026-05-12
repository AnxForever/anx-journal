import Link from 'next/link'
import { ArrowLeft, ArrowRight, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type SeriesItem = {
	slug: string
	kicker: string
	title: string
}

const handbookSeries: SeriesItem[] = [
	{
		slug: 'ai-tool-handbook',
		kicker: '目录',
		title: 'AI 编程工具手册'
	},
	{
		slug: 'ai-tool-handbook-codex',
		kicker: '第一章',
		title: 'Codex 入口选择'
	},
	{
		slug: 'ai-tool-handbook-codex-network',
		kicker: '第二章',
		title: 'API Key、中转站与国内模型'
	},
	{
		slug: 'ai-tool-handbook-claude-code',
		kicker: '第三章',
		title: 'Claude Code'
	},
	{
		slug: 'ai-tool-handbook-mcp',
		kicker: '第四章',
		title: 'MCP'
	},
	{
		slug: 'ai-tool-handbook-skills',
		kicker: '第五章',
		title: 'Skills'
	},
	{
		slug: 'ai-tool-handbook-deploy-cn',
		kicker: '附录',
		title: '国内访问与部署'
	}
]

function ChapterLink({
	item,
	direction,
	className
}: {
	item: SeriesItem
	direction: 'prev' | 'next' | 'index'
	className?: string
}) {
	const isPrev = direction === 'prev'
	const isIndex = direction === 'index'
	const label = isIndex ? '回到目录' : isPrev ? '上一章' : '下一章'
	const Icon = isIndex ? List : isPrev ? ArrowLeft : ArrowRight

	return (
		<Link
			href={`/blog/${item.slug}`}
			className={cn(
				'group flex min-h-20 min-w-0 items-center gap-3 rounded-xl border bg-white/55 px-4 py-3 transition-colors hover:border-brand/40 hover:bg-white/75',
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
	const indexItem = handbookSeries[0]

	if (!next && !previous) return null

	return (
		<nav className='mt-12 border-t pt-6' aria-label='手册章节导航'>
			<div className='text-secondary mb-3 text-xs'>
				{current.kicker} · {current.title}
			</div>
			<div className='grid gap-3 sm:grid-cols-2'>
				{previous ? (
					<ChapterLink item={previous} direction={previous.slug === indexItem.slug ? 'index' : 'prev'} />
				) : null}
				{next ? (
					<ChapterLink item={next} direction='next' className={previous ? undefined : 'sm:col-start-2'} />
				) : (
					<ChapterLink item={indexItem} direction='index' />
				)}
			</div>
		</nav>
	)
}
