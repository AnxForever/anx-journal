'use client'

import { ANIMATION_DELAY } from '@/consts'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useSize } from '@/hooks/use-size'

interface Props {
	className?: string
	order: number
	width: number
	height?: number
	x: number
	y: number
	children: React.ReactNode
}

export default function Card({ children, order, width, height, x, y, className }: Props) {
	const { maxSM, init } = useSize()
	let [show, setShow] = useState(false)
	if (maxSM && init) order = 0

	useEffect(() => {
		if (show) return
		if (x === 0 && y === 0) return
		setTimeout(
			() => {
				setShow(true)
			},
			order * ANIMATION_DELAY * 1000
		)
	}, [x, y, show])

	if (show) {
		const reduceTapHover = maxSM && init
		return (
			<motion.div
				className={cn(
					'card squircle',
					reduceTapHover && 'max-sm:active:scale-[0.98] max-sm:transition-transform',
					className
				)}
				initial={{ opacity: 0, scale: reduceTapHover ? 1 : 0.6, left: x, top: y, width, height }}
				animate={{ opacity: 1, scale: 1, left: x, top: y, width, height }}
				whileHover={reduceTapHover ? undefined : { scale: 1.05 }}
				whileTap={reduceTapHover ? undefined : { scale: 0.95 }}>
				{children}
			</motion.div>
		)
	}

	return null
}
