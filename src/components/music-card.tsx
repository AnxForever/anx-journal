'use client'

import { useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause, Play } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useSize } from '@/hooks/use-size'
import { useMusicPlayer } from '@/components/music-player-context'

export default function MusicCard() {
	const pathname = usePathname()
	const { maxLG } = useSize()
	const { isPlaying, progress, togglePlayPause } = useMusicPlayer()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}

		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	// 首页：音乐在点赞旁内联，此处不渲染（移动端小屏亦同）
	if (isHomePage) {
		return null
	}

	if (!isPlaying) {
		return null
	}

	if (maxLG) {
		return (
			<button
				type='button'
				onClick={togglePlayPause}
				aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
				className='border-brand/30 bg-card/95 text-brand shadow-brand/10 fixed left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-md backdrop-blur-sm transition-opacity hover:opacity-90'
				style={{ bottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
				{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
			</button>
		)
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}
				className={clsx('z-20 flex items-center gap-3', 'fixed')}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-10.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
						/>
						<img
							src='/images/christmas/snow-11.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm'>Aimer - Refrain</div>

					<div className='mt-1 h-2 rounded-full bg-white/60'>
						<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
					</div>
				</div>

				<button onClick={togglePlayPause} className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
					{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <Play className='text-brand h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
