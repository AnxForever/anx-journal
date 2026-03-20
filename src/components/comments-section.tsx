'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

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

/** Frosted / liquid-glass — article tint, slightly lighter shadow for slim bar */
function glassShell(className?: string) {
	return [
		'border border-white/50 bg-article/50',
		'shadow-[0_6px_28px_-10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]',
		'backdrop-blur-xl backdrop-saturate-150',
		className
	]
		.filter(Boolean)
		.join(' ')
}

export function CommentsSection({
	slug,
	title = '文章评论',
	listTitle = '最新评论',
	emptyLabel = '还没有评论，来做第一个留言的人吧。',
	submitLabel = '发送',
	textareaPlaceholder = '想说点什么…'
}: CommentsSectionProps) {
	const [comments, setComments] = useState<CommentItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [message, setMessage] = useState('')

	useEffect(() => {
		setMessage('')
		setComments([])
		setLoading(true)
	}, [slug])

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

	return (
		<div id='comments' className='mx-auto mt-4 max-w-[1140px] px-6 pb-8 max-sm:px-3 sm:mt-6'>
			<form
				id='comments-panel'
				onSubmit={handleSubmit}
				className={`${glassShell('card static flex items-end gap-2 rounded-xl p-1.5 pl-3 sm:gap-2 sm:pl-3.5')}`}>
				<textarea
					value={message}
					onChange={e => setMessage(e.target.value)}
					placeholder={textareaPlaceholder}
					maxLength={1200}
					rows={1}
					onInput={e => {
						const el = e.target as HTMLTextAreaElement
						el.style.height = 'auto'
						el.style.height = `${Math.min(el.scrollHeight, 128)}px`
					}}
					className='text-primary placeholder:text-secondary/60 min-h-9 max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-snug outline-none sm:text-sm'
				/>
				<button
					type='submit'
					disabled={submitting || !message.trim()}
					title={submitLabel}
					aria-label={submitLabel}
					className='brand-btn btn-rounded flex h-9 min-h-9 w-9 min-w-9 shrink-0 items-center justify-center p-0 text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45 sm:h-9 sm:w-9'>
					{submitting ? <span className='text-[11px] font-medium'>…</span> : <Send className='size-3.5' strokeWidth={2} />}
				</button>
			</form>

			<p className='text-secondary mt-1.5 px-0.5 text-center text-[10px] leading-tight sm:text-left sm:text-[11px]'>
				以「{DEFAULT_NICKNAME}」发布 · 审核后显示 · {title}
			</p>

			<section className='mt-4 space-y-3'>
				<div className='flex items-center justify-between gap-2 px-0.5'>
					<span className='text-primary text-sm font-medium'>{listTitle}</span>
					<span className={`${glassShell('text-secondary rounded-full px-2 py-0.5 text-[10px] tabular-nums sm:text-xs')}`}>
						{comments.length} 条
					</span>
				</div>

				{loading ? (
					<div className='text-secondary px-0.5 text-xs'>加载中…</div>
				) : comments.length === 0 ? (
					<div className={`${glassShell('text-secondary rounded-xl px-3 py-3 text-xs sm:text-[13px]')}`}>{emptyLabel}</div>
				) : (
					<div className='space-y-2'>
						{comments.map(comment => (
							<div key={comment.id} className={`${glassShell('rounded-xl p-3 sm:rounded-[14px]')}`}>
								<div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
									<span className='text-primary text-xs font-medium'>{comment.nickname}</span>
									<span className='text-secondary text-[10px] sm:text-xs'>{comment.createdAt}</span>
									{comment.website && (
										<a
											href={comment.website}
											target='_blank'
											rel='noreferrer'
											className='text-brand rounded-full border border-white/45 bg-white/30 px-2 py-0.5 text-[10px] backdrop-blur-sm hover:underline'>
											网站
										</a>
									)}
								</div>
								<p className='text-primary mt-1.5 text-sm leading-6'>{comment.content}</p>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	)
}
