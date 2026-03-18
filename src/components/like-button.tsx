import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { BLOG_SLUG_KEY } from '@/consts'

type LikeButtonProps = {
	slug?: string
	className?: string
	delay?: number
}

export default function LikeButton({ slug = 'anxforever', delay, className }: LikeButtonProps) {
	const resolvedSlug = useMemo(() => BLOG_SLUG_KEY + slug, [slug])
	const storageKey = useMemo(() => `codex-like:${resolvedSlug}`, [resolvedSlug])
	const [liked, setLiked] = useState(false)
	const [count, setCount] = useState<number | null>(null)
	const [show, setShow] = useState(false)
	const [justLiked, setJustLiked] = useState(false)
	const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

	useEffect(() => {
		const timer = setTimeout(() => setShow(true), delay || 1000)
		return () => clearTimeout(timer)
	}, [delay])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const saved = window.localStorage.getItem(storageKey)
		if (!saved) {
			setCount(0)
			return
		}

		try {
			const parsed = JSON.parse(saved) as { liked?: boolean; count?: number }
			setLiked(Boolean(parsed.liked))
			setCount(typeof parsed.count === 'number' ? parsed.count : Number(Boolean(parsed.liked)))
		} catch {
			setCount(0)
		}
	}, [storageKey])

	useEffect(() => {
		if (!justLiked) return
		const timer = setTimeout(() => setJustLiked(false), 600)
		return () => clearTimeout(timer)
	}, [justLiked])

	const handleLike = () => {
		setJustLiked(true)

		const newParticles = Array.from({ length: 6 }, (_, i) => ({
			id: Date.now() + i,
			x: Math.random() * 60 - 30,
			y: Math.random() * 60 - 30
		}))
		setParticles(newParticles)
		setTimeout(() => setParticles([]), 1000)

		if (liked) return

		setLiked(true)
		setCount(1)
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(storageKey, JSON.stringify({ liked: true, count: 1 }))
		}
	}

	if (!show) return null

	return (
		<motion.button
			initial={{ opacity: 0, scale: 0.6 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			aria-label='Appreciate this page'
			onClick={handleLike}
			className={clsx('card heartbeat-container relative overflow-visible rounded-full p-3', className)}>
			<AnimatePresence>
				{particles.map(particle => (
					<motion.div
						key={particle.id}
						className='pointer-events-none absolute inset-0 flex items-center justify-center'
						initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
						animate={{
							opacity: [1, 1, 0],
							scale: [0, 1.2, 0.8],
							x: particle.x,
							y: particle.y
						}}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.8, ease: 'easeOut' }}>
						<Heart className='fill-rose-400 text-rose-400' size={12} />
					</motion.div>
				))}
			</AnimatePresence>

			{typeof count === 'number' && count > 0 && (
				<motion.span
					initial={{ scale: 0.4 }}
					animate={{ scale: 1 }}
					className={cn(
						'absolute -top-2 left-9 min-w-6 rounded-full px-1.5 py-1 text-center text-xs text-white tabular-nums',
						liked ? 'bg-rose-400' : 'bg-gray-300'
					)}>
					{count}
				</motion.span>
			)}

			<motion.div animate={justLiked ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.6, ease: 'easeOut' }}>
				<Heart className={clsx('heartbeat', liked ? 'fill-rose-400 text-rose-400' : 'fill-rose-200 text-rose-200')} size={28} />
			</motion.div>
		</motion.button>
	)
}
