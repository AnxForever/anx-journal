'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { MessageSquare, Send, Sparkles } from 'lucide-react'

type CommentItem = {
	id: number
	nickname: string
	content: string
	website?: string | null
	createdAt: string
}

type CommentsSectionProps = {
	slug: string
	title?: string
	description?: string
	listTitle?: string
	emptyLabel?: string
	submitLabel?: string
	textareaPlaceholder?: string
}

export function CommentsSection({
	slug,
	title = '文章评论',
	description = '欢迎留下你的看法。新评论需要经过审核后显示。',
	listTitle = '最新评论',
	emptyLabel = '还没有评论，来做第一个留言的人吧。',
	submitLabel = '发布评论',
	textareaPlaceholder = '写点什么...'
}: CommentsSectionProps) {
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

			setNickname('')
			setWebsite('')
			setContent('')
			toast.success(data.pending ? '评论已提交，等待审核' : '评论已发布')
			if (!data.pending && data.comment) {
				setComments(prev => [data.comment, ...prev])
			}
		} catch (error: any) {
			toast.error(error?.message || '评论失败')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='mx-auto grid max-w-[1140px] gap-6 px-6 pb-12 max-sm:px-0 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]'>
			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='card bg-article static space-y-6 rounded-xl p-8'>
				<div className='flex items-start justify-between gap-4'>
					<div>
						<div className='text-secondary text-[11px] tracking-[0.2em] uppercase'>Discussion</div>
						<h2 className='mt-3 text-2xl font-semibold'>{title}</h2>
						<p className='text-secondary mt-2 text-sm leading-6'>{description}</p>
					</div>
					<div className='bg-linear flex h-11 w-11 shrink-0 items-center justify-center rounded-full'>
						<MessageSquare className='h-5 w-5 text-white' />
					</div>
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
						placeholder={textareaPlaceholder}
						maxLength={1200}
						className='min-h-32 w-full resize-none rounded-xl border bg-white/70 px-4 py-3 text-sm leading-6 focus:outline-none'
					/>

					<div className='flex items-center justify-between gap-4 rounded-2xl border bg-white/55 px-4 py-3'>
						<div className='text-secondary flex items-center gap-2 text-xs'>
							<Sparkles className='h-3.5 w-3.5' />
							<span>{content.length}/1200</span>
						</div>
						<button type='submit' disabled={submitting} className='brand-btn px-5 py-2.5'>
							<Send className='h-4 w-4' />
							{submitting ? '提交中...' : submitLabel}
						</button>
					</div>
				</form>
			</motion.section>

			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className='card bg-article static rounded-xl p-8'>
				<div className='mb-5 flex items-center justify-between gap-4'>
					<div>
						<div className='text-secondary text-[11px] tracking-[0.2em] uppercase'>Archive</div>
						<h3 className='mt-2 text-lg font-semibold'>{listTitle}</h3>
					</div>
					<span className='rounded-full border bg-white/65 px-3 py-1 text-xs text-secondary'>{comments.length} 条</span>
				</div>

				{loading ? (
					<div className='text-secondary text-sm'>加载中...</div>
				) : comments.length === 0 ? (
					<div className='text-secondary rounded-2xl border bg-white/55 px-4 py-5 text-sm'>{emptyLabel}</div>
				) : (
					<div className='space-y-4'>
						{comments.map(comment => (
							<div key={comment.id} className='rounded-[28px] border bg-white/65 p-5'>
								<div className='flex flex-wrap items-center gap-3'>
									<div className='font-medium'>{comment.nickname}</div>
									<div className='text-secondary text-xs'>{comment.createdAt}</div>
									{comment.website && (
										<a href={comment.website} target='_blank' rel='noreferrer' className='text-brand rounded-full border bg-white/70 px-2.5 py-1 text-[11px] hover:underline'>
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
