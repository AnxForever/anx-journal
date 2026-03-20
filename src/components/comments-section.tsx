'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react'

const DEFAULT_NICKNAME = '访客'

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

/** Frosted / liquid-glass surface — uses --color-article like other article cards */
function glassShell(className?: string) {
	return [
		'border border-white/50 bg-article/55',
		'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.65)]',
		'backdrop-blur-xl backdrop-saturate-150',
		className
	]
		.filter(Boolean)
		.join(' ')
}

export function CommentsSection({
	slug,
	title = '文章评论',
	description = '欢迎留下你的看法。新评论需要经过审核后显示。',
	listTitle = '最新评论',
	emptyLabel = '还没有评论，来做第一个留言的人吧。',
	submitLabel = '发送',
	textareaPlaceholder = '想说点什么…'
}: CommentsSectionProps) {
	const [open, setOpen] = useState(false)
	const [comments, setComments] = useState<CommentItem[]>([])
	const [loading, setLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [message, setMessage] = useState('')

	useEffect(() => {
		setOpen(false)
		setComments([])
		setLoading(false)
		setMessage('')
	}, [slug])

	useEffect(() => {
		if (!open) return
		let cancelled = false
		const run = async () => {
			setLoading(true)
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
	}, [slug, open])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const content = message.trim()
		if (!content) {
			toast.info('请先输入内容')
			return
		}

		try {
			setSubmitting(true)
			const res = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nickname: DEFAULT_NICKNAME,
					content,
					website: ''
				})
			})

			const data = await res.json().catch(() => ({}))
			if (!res.ok) {
				throw new Error(data.error || '提交失败')
			}

			setMessage('')
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

	const countLabel =
		comments.length > 0 ? `${comments.length} 条` : open && !loading ? '0 条' : null

	return (
		<div id='comments' className='mx-auto max-w-[1140px] px-6 pb-12 max-sm:px-3'>
			<button
				type='button'
				aria-expanded={open}
				aria-controls='comments-panel'
				onClick={() => setOpen(v => !v)}
				className={`${glassShell('card static flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-shadow hover:shadow-lg sm:rounded-3xl sm:p-5')}`}>
				<div className='bg-linear flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md'>
					<MessageSquare className='h-5 w-5 text-white' />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='text-secondary text-[11px] tracking-[0.2em] uppercase'>Discussion</div>
					<div className='mt-1 flex flex-wrap items-center gap-2'>
						<span className='text-primary text-base font-semibold'>{open ? '收起评论' : '展开评论'}</span>
						{countLabel !== null && (
							<span className={`${glassShell('text-secondary rounded-full px-2.5 py-0.5 text-xs tabular-nums')}`}>{countLabel}</span>
						)}
					</div>
					<p className='text-secondary mt-1 text-xs leading-5 sm:text-sm'>{open ? description : '液态玻璃样式 · 需要时再加载'}</p>
				</div>
				<div className='text-secondary shrink-0'>
					{open ? <ChevronUp className='h-6 w-6' strokeWidth={1.75} /> : <ChevronDown className='h-6 w-6' strokeWidth={1.75} />}
				</div>
			</button>

			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						id='comments-panel'
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
						className='mt-6 space-y-6'>
						<form
							onSubmit={handleSubmit}
							className={`${glassShell('card static flex items-end gap-2 rounded-[28px] p-2 pl-4 sm:gap-3 sm:pl-5')}`}>
							<textarea
								value={message}
								onChange={e => setMessage(e.target.value)}
								placeholder={textareaPlaceholder}
								maxLength={1200}
								rows={1}
								onInput={e => {
									const el = e.target as HTMLTextAreaElement
									el.style.height = 'auto'
									el.style.height = `${Math.min(el.scrollHeight, 160)}px`
								}}
								className='text-primary placeholder:text-secondary/65 min-h-11 max-h-40 flex-1 resize-none bg-transparent py-2.5 text-sm leading-relaxed outline-none'
							/>
							<button
								type='submit'
								disabled={submitting || !message.trim()}
								title={submitLabel}
								aria-label={submitLabel}
								className='brand-btn btn-rounded flex h-11 w-11 shrink-0 items-center justify-center p-0 shadow-md disabled:cursor-not-allowed disabled:opacity-45 sm:h-12 sm:w-12'>
								{submitting ? (
									<span className='text-xs font-medium'>…</span>
								) : (
									<Send className='h-4 w-4 sm:h-[18px] sm:w-[18px]' />
								)}
							</button>
						</form>
						<p className='text-secondary px-1 text-center text-[11px] sm:text-left'>
							以「{DEFAULT_NICKNAME}」发布；新留言需审核后显示 · {title}
						</p>

						<section className={`${glassShell('card static rounded-2xl p-5 sm:rounded-3xl sm:p-8')}`}>
							<div className='mb-5 flex items-center justify-between gap-4'>
								<div>
									<div className='text-secondary text-[11px] tracking-[0.2em] uppercase'>Archive</div>
									<h3 className='mt-2 text-lg font-semibold'>{listTitle}</h3>
								</div>
								<span className={`${glassShell('text-secondary rounded-full px-3 py-1 text-xs tabular-nums')}`}>{comments.length} 条</span>
							</div>

							{loading ? (
								<div className='text-secondary text-sm'>加载中...</div>
							) : comments.length === 0 ? (
								<div className={`${glassShell('text-secondary rounded-2xl px-4 py-5 text-sm')}`}>{emptyLabel}</div>
							) : (
								<div className='space-y-3'>
									{comments.map(comment => (
										<div
											key={comment.id}
											className={`${glassShell('rounded-2xl border-white/35 p-4 sm:rounded-[24px] sm:p-5')}`}>
											<div className='flex flex-wrap items-center gap-3'>
												<div className='font-medium'>{comment.nickname}</div>
												<div className='text-secondary text-xs'>{comment.createdAt}</div>
												{comment.website && (
													<a
														href={comment.website}
														target='_blank'
														rel='noreferrer'
														className='text-brand rounded-full border border-white/50 bg-white/35 px-2.5 py-1 text-[11px] backdrop-blur-sm hover:underline'>
														个人网站
													</a>
												)}
											</div>
											<p className='mt-3 text-sm leading-7'>{comment.content}</p>
										</div>
									))}
								</div>
							)}
						</section>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
