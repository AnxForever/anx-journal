'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

type CommentItem = {
	id: number
	nickname: string
	content: string
	website?: string | null
	createdAt: string
}

export function CommentsSection({ slug }: { slug: string }) {
	const [comments, setComments] = useState<CommentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [nickname, setNickname] = useState('')
	const [website, setWebsite] = useState('')
	const [content, setContent] = useState('')

	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const res = await fetch(`/api/comments/${encodeURIComponent(slug)}`, { cache: 'no-store' })
				const data = await res.json()
				if (!cancelled) {
					setComments(Array.isArray(data.comments) ? data.comments : [])
				}
			} catch {
				if (!cancelled) {
					toast.error('加载评论失败')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [slug])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!nickname.trim() || !content.trim()) {
			toast.info('请先填写昵称和内容')
			return
		}

		try {
			setSubmitting(true)
			const res = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
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

			setComments(prev => [data.comment, ...prev])
			setNickname('')
			setWebsite('')
			setContent('')
			toast.success('评论已发布')
		} catch (error: any) {
			toast.error(error?.message || '评论失败')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='mx-auto flex max-w-[1140px] flex-col gap-6 px-6 pb-12 max-sm:px-0'>
			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='card bg-article static space-y-6 rounded-xl p-8'>
				<div>
					<h2 className='text-2xl font-semibold'>评论</h2>
					<p className='text-secondary mt-2 text-sm'>欢迎留下你的看法。</p>
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
						placeholder='写点什么...'
						maxLength={1200}
						className='min-h-32 w-full resize-none rounded-xl border bg-white/70 px-4 py-3 text-sm leading-6 focus:outline-none'
					/>

					<div className='flex items-center justify-between gap-4'>
						<span className='text-secondary text-xs'>{content.length}/1200</span>
						<button type='submit' disabled={submitting} className='brand-btn px-5 py-2.5'>
							{submitting ? '提交中...' : '发布评论'}
						</button>
					</div>
				</form>
			</motion.section>

			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className='card bg-article static rounded-xl p-8'>
				<div className='mb-5 flex items-center justify-between gap-4'>
					<h3 className='text-lg font-semibold'>最新评论</h3>
					<span className='text-secondary text-sm'>{comments.length} 条</span>
				</div>

				{loading ? (
					<div className='text-secondary text-sm'>加载中...</div>
				) : comments.length === 0 ? (
					<div className='text-secondary text-sm'>还没有评论，来做第一个留言的人吧。</div>
				) : (
					<div className='space-y-4'>
						{comments.map(comment => (
							<div key={comment.id} className='rounded-2xl border bg-white/65 p-4'>
								<div className='flex flex-wrap items-center gap-3'>
									<div className='font-medium'>{comment.nickname}</div>
									<div className='text-secondary text-xs'>{comment.createdAt}</div>
									{comment.website && (
										<a href={comment.website} target='_blank' rel='noreferrer' className='text-brand text-xs hover:underline'>
											个人网站
										</a>
									)}
								</div>
								<p className='mt-3 text-sm leading-7'>{comment.content}</p>
							</div>
						))}
					</div>
				)}
			</motion.section>
		</div>
	)
}
