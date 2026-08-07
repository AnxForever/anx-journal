'use client'

import Card from '@/components/card'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ScrollFilledSVG from '@/svgs/scroll-filled.svg'
import ProjectsFilledSVG from '@/svgs/projects-filled.svg'
import ProjectsOutlineSVG from '@/svgs/projects-outline.svg'
import AboutFilledSVG from '@/svgs/about-filled.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import ShareFilledSVG from '@/svgs/share-filled.svg'
import ShareOutlineSVG from '@/svgs/share-outline.svg'
import WebsiteFilledSVG from '@/svgs/website-filled.svg'
import WebsiteOutlineSVG from '@/svgs/website-outline.svg'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'

const list = [
	{
		icon: ScrollOutlineSVG,
		iconActive: ScrollFilledSVG,
		label: '近期文章',
		href: '/blog'
	},
	{
		icon: ProjectsOutlineSVG,
		iconActive: ProjectsFilledSVG,
		label: '我的项目',
		href: '/projects'
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于网站',
		href: '/about'
	},
	{
		icon: ShareOutlineSVG,
		iconActive: ShareFilledSVG,
		label: '推荐分享',
		href: '/share'
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '优秀博客',
		href: '/bloggers'
	}
]

const extraSize = 8
const fullListGap = 8
const fullChromeHeight = 142
const iconHitSize = 44

export default function NavCard() {
	const pathname = usePathname()
	const router = useRouter()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxLG } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number>(0)
	const siteContent = useConfigStore(s => s.siteContent)
	const cardStyles = useConfigStore(s => s.cardStyles)
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	const activeIndex = useMemo(() => {
		const index = list.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
	}, [pathname])

	useEffect(() => {
		setShow(true)
	}, [])

	let form = useMemo(() => {
		if (pathname == '/') return 'full'
		else if (pathname == '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxLG) form = 'icons'

	const itemHeight = form === 'full' ? 52 : iconHitSize
	const iconsGap = maxLG ? 6 : 10
	const outerGap = maxLG ? 8 : 16
	const iconsRowWidth = list.length * itemHeight + (list.length - 1) * iconsGap
	const fullCardHeight = useMemo(() => {
		const listHeight = list.length * 52 + (list.length - 1) * fullListGap
		return Math.max(styles.height, fullChromeHeight + listHeight)
	}, [styles.height])

	let position = useMemo(() => {
		if (form === 'full') {
			const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING
			const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 - fullCardHeight
			return { x, y }
		}

		return {
			x: 24,
			y: 16
		}
	}, [form, center, styles, hiCardStyles, fullCardHeight])

	const size = useMemo(() => {
		if (form === 'mini') return { width: 64, height: 64 }
		else if (form === 'icons') return { width: 24 + 40 + outerGap + iconsRowWidth, height: 64 }
		else return { width: styles.width, height: fullCardHeight }
	}, [form, styles, outerGap, iconsRowWidth, fullCardHeight])
	const showHoverIndicator = form !== 'icons' || activeIndex !== undefined

	useEffect(() => {
		if (form === 'icons' && activeIndex !== undefined && hoveredIndex !== activeIndex) {
			setHoveredIndex(activeIndex)
		}
	}, [hoveredIndex, activeIndex, form])

	const handleNavigate = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
		if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
		event.preventDefault()
		if (pathname !== href) {
			router.push(href)
		}
	}

	if (maxLG) position = { x: center.x - size.width / 2, y: 16 }

	if (show)
		return (
			<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={size.width} height={size.height}>
				<Card
					order={styles.order}
					width={size.width}
					height={size.height}
					x={position.x}
					y={position.y}
					className={clsx(
						'z-[1000]',
						form != 'full' && 'overflow-hidden',
						form === 'mini' && 'p-3',
						form === 'icons' && 'flex items-center p-3',
						form === 'icons' && (maxLG ? 'gap-4' : 'gap-6')
					)}>
					{form === 'full' && siteContent.enableChristmas && (
						<>
							<img
								src='/images/christmas/snow-4.webp'
								alt='Christmas decoration'
								className='pointer-events-none absolute'
								style={{ width: 160, left: -18, top: -20, opacity: 0.9 }}
							/>
						</>
					)}

					<Link
						className={cn('relative z-20 flex shrink-0 items-center gap-3 rounded-full', form === 'icons' ? 'h-11 w-11 justify-center' : 'min-h-11')}
						href='/'
						prefetch
						title='返回主页'
						aria-label='返回主页'
						onClick={handleNavigate('/')}
						onMouseEnter={() => router.prefetch('/')}>
						<Image
							src='/images/avatar.jpg'
							alt='avatar'
							width={40}
							height={40}
							priority
							style={{ boxShadow: ' 0 12px 20px -5px #E2D9CE' }}
							className='rounded-full'
						/>
						{form === 'full' && <span className='font-averia mt-1 text-2xl leading-none font-medium'>{siteContent.meta.title}</span>}
						{form === 'full' && <span className='text-brand mt-2 text-xs font-medium'>(开发中)</span>}
					</Link>

					{(form === 'full' || form === 'icons') && (
						<>
							{form !== 'icons' && <div className='text-secondary mt-6 text-sm uppercase'>General</div>}

							<div
								className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0 flex shrink-0 items-center space-y-0')}
								style={form === 'icons' ? { gap: iconsGap } : undefined}>
								<motion.div
									className={cn('pointer-events-none absolute max-w-[230px] rounded-full border', !showHoverIndicator && 'hidden')}
									layoutId='nav-hover'
									initial={false}
									animate={
										form === 'icons'
											? {
													left: hoveredIndex * (itemHeight + iconsGap) - extraSize,
													top: -extraSize,
													width: itemHeight + extraSize * 2,
													height: itemHeight + extraSize * 2
												}
											: { top: hoveredIndex * (itemHeight + 8), left: 0, width: '100%', height: itemHeight }
									}
									transition={{
										type: 'spring',
										stiffness: 400,
										damping: 30
									}}
									style={{ backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' }}
								/>

								{list.map((item, index) => (
									<Link
										key={item.href}
										href={item.href}
										prefetch
										title={item.label}
										aria-label={item.label}
										className={cn(
											'text-secondary text-md relative z-20 flex items-center justify-center gap-3 rounded-full px-5 py-3',
											form === 'icons' && 'h-11 w-11 shrink-0 p-0'
										)}
										onClick={handleNavigate(item.href)}
										onMouseEnter={() => {
											if (form !== 'icons') setHoveredIndex(index)
											router.prefetch(item.href)
										}}
										onFocus={() => {
											if (form !== 'icons') setHoveredIndex(index)
										}}>
										<div className='relative flex h-7 w-7 items-center justify-center'>
											{hoveredIndex == index ? <item.iconActive className='text-brand absolute h-7 w-7' /> : <item.icon className='absolute h-7 w-7' />}
										</div>
										{form !== 'icons' && <span className={clsx(index == hoveredIndex && 'text-primary font-medium')}>{item.label}</span>}
									</Link>
								))}
							</div>
						</>
					)}
				</Card>
			</HomeDraggableLayer>
		)
}
