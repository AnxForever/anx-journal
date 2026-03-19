'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

type GuestbookItem = {
	id: number
	nickname: string
	content: string
	website?: string | null
	createdAt: string
}

export function GuestbookSection() {
	const [entries, setEntries] = useState<GuestbookItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [nickname, setNickname] = useState('')
	const [website, setWebsite] = useState('')
	const [content, setContent] = useState('')

	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const res = await fetch('/api/guestbook', { cache: 'no-store' })
				const data = await res.json()
				if (!cancelled) {
					setEntries(Array.isArray(data.entries) ? data.entries : [])
				}
			} catch {
				if (!cancelled) toast.error('加载留言板失败')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!nickname.trim() || !content.trim()) {
			toast.info('请先填写昵称和内容')
			return
		}

		try {
			setSubmitting(true)
			const res = await fetch('/api/guestbook', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nickname,
					website,
					content
				})
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) {
				throw new Error(data.error || '提交失败')
			}

			setEntries(prev => [data.entry, ...prev])
			setNickname('')
			setWebsite('')
			setContent('')
			toast.success('留言成功')
		} catch (error: any) {
			toast.error(error?.message || '留言失败')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='flex flex-col gap-6'>
			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='card bg-article static rounded-xl p-8'>
				<div className='mb-6'>
					<h2 className='text-3xl font-semibold'>留言板</h2>
					<p className='text-secondary mt-3 text-sm leading-6'>如果你路过这里，欢迎留下几句话。可以是打招呼，也可以是建议，或者只是一个简短的足迹。</p>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-2'>
						<input
							value={nickname}
							onChange={e => setNickname(e.target.value)}
							placeholder='昵称'
							maxLength={80}
							className='rounded-xl border bg-white/70 px-4 py-3 text-sm focus:outline-none'
						/>
						<input
							value={website}
							onChange={e => setWebsite(e.target.value)}
							placeholder='网站（可选）'
							maxLength={255}
							className='rounded-xl border bg-white/70 px-4 py-3 text-sm focus:outline-none'
						/>
					</div>

					<textarea
						value={content}
						onChange={e => setContent(e.target.value)}
						placeholder='留言内容'
						maxLength={1200}
						className='min-h-36 w-full resize-none rounded-xl border bg-white/70 px-4 py-3 text-sm leading-6 focus:outline-none'
					/>

					<div className='flex items-center justify-between gap-4'>
						<span className='text-secondary text-xs'>{content.length}/1200</span>
						<button type='submit' disabled={submitting} className='brand-btn px-5 py-2.5'>
							{submitting ? '提交中...' : '发布留言'}
						</button>
					</div>
				</form>
			</motion.section>

			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className='card bg-article static rounded-xl p-8'>
				<div className='mb-5 flex items-center justify-between gap-4'>
					<h3 className='text-lg font-semibold'>最近留言</h3>
					<span className='text-secondary text-sm'>{entries.length} 条</span>
				</div>

				{loading ? (
					<div className='text-secondary text-sm'>加载中...</div>
				) : entries.length === 0 ? (
					<div className='text-secondary text-sm'>还没有留言，欢迎留下第一条。</div>
				) : (
					<div className='space-y-4'>
						{entries.map(entry => (
							<div key={entry.id} className='rounded-2xl border bg-white/65 p-4'>
								<div className='flex flex-wrap items-center gap-3'>
									<div className='font-medium'>{entry.nickname}</div>
									<div className='text-secondary text-xs'>{entry.createdAt}</div>
									{entry.website && (
										<a href={entry.website} target='_blank' rel='noreferrer' className='text-brand text-xs hover:underline'>
											个人网站
										</a>
									)}
								</div>
								<p className='mt-3 text-sm leading-7'>{entry.content}</p>
							</div>
						))}
					</div>
				)}
			</motion.section>
		</div>
	)
}
