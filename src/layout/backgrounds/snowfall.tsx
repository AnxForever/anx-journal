'use client'
import { useEffect, useState } from 'react'

interface Snowflake {
	id: number
	type: 'dot' | 'image'
	imageIndex?: number
	size: number
	duration: number
	delay: number
	left: number
}

const SNOWFLAKE_IMAGES = ['/images/christmas/snowflake/1.webp', '/images/christmas/snowflake/2.webp', '/images/christmas/snowflake/3.webp']
const DOT_RATIO = 0.8

export default function SnowfallBackground({ zIndex, count = 125 }: { zIndex: number; count?: number }) {
	const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

	useEffect(() => {
		const newSnowflakes: Snowflake[] = []
		for (let i = 0; i < count; i++) {
			const isDot = Math.random() < DOT_RATIO
			newSnowflakes.push({
				id: i,
				type: isDot ? 'dot' : 'image',
				imageIndex: isDot ? undefined : Math.floor(Math.random() * SNOWFLAKE_IMAGES.length),
				size: isDot ? Math.random() * 10 + 5 : Math.random() * 40 + 20,
				duration: Math.random() * 20 + 20,
				delay: Math.random() * 40,
				left: Math.random() * 120
			})
		}
		setSnowflakes(newSnowflakes)
	}, [count])

	return (
		<div className='pointer-events-none fixed inset-0 overflow-hidden' style={{ zIndex }}>
			{snowflakes.map(sf => (
				<div
					key={sf.id}
					className='animate-snowfall absolute'
					style={{
						top: -200,
						left: `${sf.left}%`,
						width: `${sf.size}px`,
						height: `${sf.size}px`,
						animationDuration: `${sf.duration}s`,
						animationDelay: `${sf.delay}s`
					}}>
					{sf.type === 'dot' ? (
						<div className='h-full w-full rounded-full bg-white' />
					) : (
						<img src={SNOWFLAKE_IMAGES[sf.imageIndex!]} alt='' className='h-full w-full object-contain' draggable={false} />
					)}
				</div>
			))}
		</div>
	)
}
