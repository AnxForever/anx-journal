'use client'

import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import useSWR from 'swr'

const GITHUB_USER = 'AnxForever'
const CHART_URL = `https://ghchart.rshah.org/${GITHUB_USER}`

type ContributionData = { username: string; total: number }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GithubCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.githubCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard

	const { data } = useSWR<ContributionData>('/api/github', fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 3600000
	})

	const x =
		styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y =
		styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING

	return (
		<HomeDraggableLayer cardKey='githubCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex flex-col p-3'>
				<div className='text-secondary flex items-center justify-between text-xs'>
					<a href={`https://github.com/${GITHUB_USER}`} target='_blank' className='hover:underline'>
						@{GITHUB_USER}
					</a>
					{data && <span>{data.total.toLocaleString()} contributions</span>}
				</div>
				<div className='mt-2 flex-1 overflow-hidden rounded-lg'>
					<img
						src={CHART_URL}
						alt='GitHub contributions'
						className='h-full w-full object-cover'
						loading='lazy'
					/>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
