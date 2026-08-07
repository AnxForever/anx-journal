'use client'

import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING, GITHUB_CONFIG } from '@/consts'
import { cn } from '@/lib/utils'
import { HomeDraggableLayer } from './home-draggable-layer'
import useSWR from 'swr'

const GITHUB_USER = GITHUB_CONFIG.OWNER

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type ContributionData = { username: string; total: number; days: Day[] }

const fetcher = (url: string) => fetch(url).then(r => r.json())

// 每级用品牌色 teal 由浅到深。注意：必须用 white 做底混色而非 transparent，
// 否则低活跃格子大面积透明，会把身后的暖色渐变背景透上来染成脏粉色。
const LEVEL_BG = [
	'color-mix(in srgb, var(--color-secondary) 14%, white)',
	'color-mix(in srgb, var(--color-brand) 30%, white)',
	'color-mix(in srgb, var(--color-brand) 52%, white)',
	'color-mix(in srgb, var(--color-brand) 75%, white)',
	'var(--color-brand)'
]

const WEEKDAY_LABELS = ['一', '', '三', '', '五', '', '日']
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 以 YYYY-MM-DD 用 UTC 解析，避免时区把某天挪到前后一天
const weekdayOf = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7 // 周一=0 … 周日=6

// 把扁平的按天数组切成「列=周」的网格。首列按真实星期几补齐空档，
// 保证每一行对应固定星期几（周一→周日），和 GitHub 主页一致。
function buildColumns(days: Day[]): (Day | null)[][] {
	if (days.length === 0) return []
	const columns: (Day | null)[][] = []
	let col: (Day | null)[] = new Array(weekdayOf(days[0].date)).fill(null)

	for (const day of days) {
		col.push(day)
		if (col.length === 7) {
			columns.push(col)
			col = []
		}
	}
	if (col.length > 0) {
		while (col.length < 7) col.push(null)
		columns.push(col)
	}
	return columns
}

// 生成月份标签：某列首个有效日期的月份 与 前一列不同时，在该列打点。
// 跳过最后两列附近的月点，避免标签在卡片右缘换行/溢出。
function monthTicks(columns: (Day | null)[][]): { index: number; label: string }[] {
	const ticks: { index: number; label: string }[] = []
	let lastMonth = -1
	columns.forEach((col, index) => {
		const firstDay = col.find(Boolean)
		if (!firstDay) return
		const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth()
		if (month !== lastMonth) {
			if (index < columns.length - 2) ticks.push({ index, label: MONTH_LABELS[month] })
			lastMonth = month
		}
	})
	return ticks
}

export default function GithubCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.calendarCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard

	const { data } = useSWR<ContributionData>('/api/contributions', fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 3600000
	})

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING

	const columns = data?.days?.length ? buildColumns(data.days) : []
	const ticks = columns.length ? monthTicks(columns) : []
	const compact = styles.width < 300 || styles.height < 240

	return (
		<HomeDraggableLayer cardKey='calendarCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex flex-col'>
				{siteContent.enableChristmas && (
					<img
						src='/images/christmas/snow-7.webp'
						alt='Christmas decoration'
						className='pointer-events-none absolute'
						style={{ width: 150, right: -12, top: -12, opacity: 0.8 }}
					/>
				)}

				<div className='text-secondary flex items-baseline justify-between text-sm'>
					<a href={`https://github.com/${GITHUB_USER}`} target='_blank' rel='noopener noreferrer' className='hover:text-brand font-medium transition-colors'>
						GitHub
					</a>
					{data && data.total > 0 && (
						<span className='text-xs'>
							近一年 <span className='text-brand font-medium'>{data.total.toLocaleString()}</span> 次贡献
						</span>
					)}
				</div>

				<div className='mt-3 flex flex-1 flex-col justify-center'>
					{columns.length > 0 ? (
						<>
							<div className='flex gap-[3px]'>
								{/* 左侧星期标签 */}
								<div className='text-secondary mr-0.5 flex flex-col justify-between py-[1px] text-[9px] leading-none'>
									{WEEKDAY_LABELS.map((label, i) => (
										<span key={i} className='flex h-[10px] items-center'>
											{label}
										</span>
									))}
								</div>
								{/* 贡献格子：每列一周 */}
								<div className='flex flex-1 gap-[3px]'>
									{columns.map((col, ci) => (
										<div key={ci} className='flex flex-1 flex-col gap-[3px]'>
											{col.map((day, di) => (
												<div
													key={di}
													className='aspect-square w-full rounded-[2px]'
													style={{ background: day ? LEVEL_BG[day.level] : 'transparent' }}
													title={day ? `${day.date}：${day.count} 次贡献` : undefined}
												/>
											))}
										</div>
									))}
								</div>
							</div>
							{/* 月份标签 */}
							{!compact && (
								<div className='text-secondary relative mt-1.5 ml-[calc(0.75rem+3px)] h-3 text-[9px] leading-none'>
									{ticks.map(({ index, label }) => (
										<span key={index} className='absolute' style={{ left: `${(index / columns.length) * 100}%` }}>
											{label}
										</span>
									))}
								</div>
							)}
						</>
					) : (
						// 加载 / 无数据骨架
						<div className='flex gap-[3px]'>
							<div className='mr-0.5 w-3 shrink-0' />
							<div className='flex flex-1 gap-[3px]'>
								{Array.from({ length: 26 }, (_, ci) => (
									<div key={ci} className='flex flex-1 flex-col gap-[3px]'>
										{Array.from({ length: 7 }, (_, di) => (
											<div key={di} className='aspect-square w-full animate-pulse rounded-[2px] bg-black/5' />
										))}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<a
					href={`https://github.com/${GITHUB_USER}`}
					target='_blank'
					rel='noopener noreferrer'
					className={cn('text-secondary hover:text-brand mt-2 text-right text-xs transition-colors', compact && 'mt-1')}>
					@{GITHUB_USER}
				</a>
			</Card>
		</HomeDraggableLayer>
	)
}