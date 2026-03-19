'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import shareList from '@/app/share/list.json'
import projectList from '@/app/projects/list.json'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'

type ShareItem = {
	name: string
	url: string
	logo: string
	description: string
	tags: string[]
	stars: number
}

type ProjectItem = {
	name: string
	url: string
	image: string
	description: string
	tags: string[]
}

type FeaturedItem =
	| { kind: 'share'; title: string; href: string; image: string; description: string }
	| { kind: 'project'; title: string; href: string; image: string; description: string }

export default function ShareCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const [featuredItem, setFeaturedItem] = useState<FeaturedItem | null>(null)
	const styles = cardStyles.shareCard
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons

	useEffect(() => {
		const projects = projectList as ProjectItem[]
		const stylekitProject = projects.find(project => project.name.toLowerCase() === 'stylekit') || projects[0]

		if (stylekitProject) {
			setFeaturedItem({
				kind: 'project',
				title: stylekitProject.name,
				href: '/projects',
				image: stylekitProject.image,
				description: stylekitProject.description
			})
			return
		}

		const randomIndex = Math.floor(Math.random() * shareList.length)
		const randomItem = (shareList as ShareItem[])[randomIndex]
		setFeaturedItem({
			kind: 'share',
			title: randomItem.name,
			href: '/share',
			image: randomItem.logo,
			description: randomItem.description
		})
	}, [])

	if (!featuredItem) {
		return null
	}

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING

	return (
		<HomeDraggableLayer cardKey='shareCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-12.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -12, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<Link href={featuredItem.href} className='block h-full transition-opacity hover:opacity-80'>
					<h2 className='text-secondary text-sm'>{featuredItem.kind === 'project' ? '近期项目' : '随机推荐'}</h2>

					<div className='mt-2 space-y-2'>
						<div className='flex items-center'>
							<div className='relative mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-xl'>
								<img src={featuredItem.image} alt={featuredItem.title} className='h-full w-full object-contain' />
							</div>
							<div>
								<h3 className='text-sm font-medium'>{featuredItem.title}</h3>
								{featuredItem.kind === 'project' && <div className='text-brand mt-1 text-[10px] font-medium'>Featured</div>}
							</div>
						</div>

						<p className='text-secondary line-clamp-3 text-xs'>{featuredItem.description}</p>
					</div>
				</Link>
			</Card>
		</HomeDraggableLayer>
	)
}
