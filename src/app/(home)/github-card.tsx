'use client'

import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import useSWR from 'swr'

const GITHUB_USER = 'AnxForever'
const LEVEL_COLORS = ['bg-white/40', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800']

type ContributionCell = { date: string; level: number; count: number | null }
type ContributionData = { username: string; total: number; cells: ContributionCell[] }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GithubCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.githubCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard

	const { data } = useSWR<ContributionData>(
		`https://contribkit.app/api/contributions?user=${GITHUB_USER}`,
		fetcher,
		{ revalidateOnFocus: false, dedupingInterval: 3600000 }
	)

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: center.x + CARD_SPACING + hiCardStyles.width / 2
	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y - clockCardStyles.offset + CARD_SPACING

	const weeks = data?.cells?.length ? buildGrid(data.cells) : []

	return (
		<HomeDraggableLayer cardKey='githubCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex flex-col p-3'>
				<div className='text-secondary flex items-center justify-between text-xs'>
					<span>GitHub</span>
					{data && <span>{data.total.toLocaleString()} contributions</span>}
				</div>
				<div className='mt-2 flex flex-1 flex-col justify-center'>
					{weeks.length > 0 ? (
						<div className='flex gap-0.5'>
							{weeks.map((week, wi) => (
								<div key={wi} className='flex flex-col gap-0.5'>
									{week.map((level, di) => (
										<div
											key={di}
											className={`h-2 w-2 rounded-sm ${LEVEL_COLORS[level] || LEVEL_COLORS[0]}`}
											title={data?.cells[wi * 7 + di]?.date}
										/>
									))}
								</div>
							))}
						</div>
					) : (
						<div className='flex gap-0.5'>
							{Array.from({ length: 20 }, (_, wi) => (
								<div key={wi} className='flex flex-col gap-0.5'>
									{Array.from({ length: 7 }, (_, di) => (
										<div key={di} className='h-2 w-2 rounded-sm bg-white/20' />
									))}
								</div>
							))}
						</div>
					)}
				</div>
				<a
					href={`https://github.com/${GITHUB_USER}`}
					target='_blank'
					className='text-secondary mt-2 text-right text-xs hover:underline'
				>
					@{GITHUB_USER}
				</a>
			</Card>
		</HomeDraggableLayer>
	)
}

function buildGrid(cells: ContributionCell[]): number[][] {
	const weeks: number[][] = []
	let currentWeek: number[] = []

	for (const cell of cells) {
		currentWeek.push(cell.level)
		if (currentWeek.length === 7) {
			weeks.push(currentWeek)
			currentWeek = []
		}
	}
	if (currentWeek.length > 0) {
		while (currentWeek.length < 7) currentWeek.push(0)
		weeks.push(currentWeek)
	}

	// 只显示最近 20 周
	return weeks.slice(-20)
}
