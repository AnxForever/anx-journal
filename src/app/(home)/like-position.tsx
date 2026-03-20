import LikeButton from '@/components/like-button'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { motion } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore, type SiteContent } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useMusicPlayer } from '@/components/music-player-context'
import MusicSVG from '@/svgs/music.svg'

function MusicHomeInline({ siteContent }: { siteContent: SiteContent }) {
	const { isPlaying, progress, togglePlayPause } = useMusicPlayer()

	return (
		<div className='border-brand/20 bg-card/90 text-brand relative flex max-w-[min(100%,280px)] items-center gap-2 rounded-[28px] border px-3 py-2 shadow-md backdrop-blur-sm'>
			{siteContent.enableChristmas && (
				<img
					src='/images/christmas/snow-10.webp'
					alt=''
					className='pointer-events-none absolute'
					style={{ width: 56, left: -6, top: -8, opacity: 0.75 }}
				/>
			)}
			<MusicSVG className='relative z-10 h-7 w-7 shrink-0' />
			<div className='relative z-10 min-w-0 flex-1'>
				<div className='text-secondary line-clamp-1 text-xs font-medium'>Aimer - Refrain</div>
				<div className='mt-1 h-1.5 rounded-full bg-white/60'>
					<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
				</div>
			</div>
			<button
				type='button'
				onClick={togglePlayPause}
				aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
				className='relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 transition-opacity hover:opacity-90'>
				{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <Play className='text-brand h-4 w-4' />}
			</button>
		</div>
	)
}

export default function LikePosition() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.likePosition
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons
	const musicCardStyles = cardStyles.musicCard
	const shareCardStyles = cardStyles.shareCard
	const musicOn = cardStyles.musicCard?.enabled !== false

	const x =
		styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width + shareCardStyles.width + CARD_SPACING
	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING + musicCardStyles.height + CARD_SPACING

	return (
		<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				className='absolute max-lg:static flex flex-col items-center gap-3 max-lg:max-w-[min(100vw-2rem,360px)] sm:flex-row'
				initial={{ left: x, top: y }}
				animate={{ left: x, top: y }}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-13.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 40, left: -4, top: -4, opacity: 0.9 }}
						/>
					</>
				)}

				<LikeButton delay={cardStyles.shareCard.order * ANIMATION_DELAY * 1000} />
				{musicOn && <MusicHomeInline siteContent={siteContent} />}
			</motion.div>
		</HomeDraggableLayer>
	)
}
