'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ModerationStatus = 'pending' | 'approved' | 'rejected'

type CommentModerationItem = {
	id: number
	postSlug: string
	nickname: string
	content: string
	email?: string | null
	website?: string | null
	status: ModerationStatus
	createdAt: string
}

type GuestbookModerationItem = {
	id: number
	nickname: string
	content: string
	email?: string | null
	website?: string | null
	status: ModerationStatus
	createdAt: string
}

const TOKEN_STORAGE_KEY = 'anx-journal-admin-token'

export function ModerationPanel() {
	const [token, setToken] = useState('')
	const [connected, setConnected] = useState(false)
	const [comments, setComments] = useState<CommentModerationItem[]>([])
	const [guestbookEntries, setGuestbookEntries] = useState<GuestbookModerationItem[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const saved = window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
		if (saved) {
			setToken(saved)
		}
	}, [])

	const loadData = async (adminToken: string) => {
		setLoading(true)
		try {
			const [commentsRes, guestbookRes] = await Promise.all([
				fetch('/api/admin/comments?status=pending', {
					headers: { 'x-admin-token': adminToken },
					cache: 'no-store'
				}),
				fetch('/api/admin/guestbook?status=pending', {
					headers: { 'x-admin-token': adminToken },
					cache: 'no-store'
				})
			])

			if (commentsRes.status === 401 || guestbookRes.status === 401) {
				throw new Error('管理令牌无效')
			}

			const commentsData = await commentsRes.json().catch(() => ({}))
			const guestbookData = await guestbookRes.json().catch(() => ({}))

			setComments(Array.isArray(commentsData.comments) ? commentsData.comments : [])
			setGuestbookEntries(Array.isArray(guestbookData.entries) ? guestbookData.entries : [])
			setConnected(true)
			window.sessionStorage.setItem(TOKEN_STORAGE_KEY, adminToken)
		} catch (error: any) {
			setConnected(false)
			toast.error(error?.message || '加载审核数据失败')
		} finally {
			setLoading(false)
		}
	}

	const handleConnect = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!token.trim()) {
			toast.info('请输入管理令牌')
			return
		}
		await loadData(token.trim())
	}

	const handleModerate = async (type: 'comments' | 'guestbook', id: number, status: 'approved' | 'rejected') => {
		try {
			const res = await fetch(`/api/admin/${type}/${id}`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json',
					'x-admin-token': token
				},
				body: JSON.stringify({ status })
			})
			const data = await res.json().catch(() => ({}))
			if (!res.ok) {
				throw new Error(data.error || '审核失败')
			}

			if (type === 'comments') {
				setComments(prev => prev.filter(item => item.id !== id))
			} else {
				setGuestbookEntries(prev => prev.filter(item => item.id !== id))
			}
			toast.success(status === 'approved' ? '已通过' : '已拒绝')
		} catch (error: any) {
			toast.error(error?.message || '审核失败')
		}
	}

	const handleDisconnect = () => {
		window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
		setConnected(false)
		setComments([])
		setGuestbookEntries([])
		setToken('')
	}

	return (
		<div className='mx-auto max-w-[1140px] px-6 pt-28 pb-12 max-sm:px-0'>
			<div className='card bg-article static space-y-6 rounded-xl p-8'>
				<div>
					<h1 className='text-3xl font-semibold'>审核台</h1>
					<p className='text-secondary mt-3 text-sm leading-6'>这里只处理待审核的评论和留言。页面本身不公开入口，使用管理令牌进入。</p>
				</div>

				<form onSubmit={handleConnect} className='flex flex-col gap-4 md:flex-row'>
					<input
						type='password'
						value={token}
						onChange={e => setToken(e.target.value)}
						placeholder='输入管理令牌'
						className='flex-1 rounded-xl border bg-white/70 px-4 py-3 text-sm focus:outline-none'
					/>
					<button type='submit' disabled={loading} className='brand-btn px-5 py-3'>
						{loading ? '连接中...' : connected ? '刷新审核队列' : '连接审核台'}
					</button>
					{connected && (
						<button type='button' onClick={handleDisconnect} className='rounded-xl border bg-white/70 px-5 py-3 text-sm'>
							断开
						</button>
					)}
				</form>
			</div>

			{connected && (
				<div className='mt-6 grid gap-6 lg:grid-cols-2'>
					<section className='card bg-article static rounded-xl p-8'>
						<div className='mb-5 flex items-center justify-between gap-4'>
							<h2 className='text-xl font-semibold'>待审核评论</h2>
							<span className='text-secondary text-sm'>{comments.length} 条</span>
						</div>
						{comments.length === 0 ? (
							<div className='text-secondary text-sm'>当前没有待审核评论。</div>
						) : (
							<div className='space-y-4'>
								{comments.map(item => (
									<div key={item.id} className='rounded-2xl border bg-white/65 p-4'>
										<div className='flex flex-wrap gap-3 text-xs text-secondary'>
											<span>{item.nickname}</span>
											<span>{item.createdAt}</span>
											<span>/blog/{item.postSlug}</span>
										</div>
										<p className='mt-3 text-sm leading-7'>{item.content}</p>
										<div className='mt-4 flex gap-3'>
											<button onClick={() => handleModerate('comments', item.id, 'approved')} className='brand-btn px-4 py-2 text-xs'>
												通过
											</button>
											<button onClick={() => handleModerate('comments', item.id, 'rejected')} className='rounded-xl border bg-white/70 px-4 py-2 text-xs'>
												拒绝
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					<section className='card bg-article static rounded-xl p-8'>
						<div className='mb-5 flex items-center justify-between gap-4'>
							<h2 className='text-xl font-semibold'>待审核留言</h2>
							<span className='text-secondary text-sm'>{guestbookEntries.length} 条</span>
						</div>
						{guestbookEntries.length === 0 ? (
							<div className='text-secondary text-sm'>当前没有待审核留言。</div>
						) : (
							<div className='space-y-4'>
								{guestbookEntries.map(item => (
									<div key={item.id} className='rounded-2xl border bg-white/65 p-4'>
										<div className='flex flex-wrap gap-3 text-xs text-secondary'>
											<span>{item.nickname}</span>
											<span>{item.createdAt}</span>
										</div>
										<p className='mt-3 text-sm leading-7'>{item.content}</p>
										<div className='mt-4 flex gap-3'>
											<button onClick={() => handleModerate('guestbook', item.id, 'approved')} className='brand-btn px-4 py-2 text-xs'>
												通过
											</button>
											<button onClick={() => handleModerate('guestbook', item.id, 'rejected')} className='rounded-xl border bg-white/70 px-4 py-2 text-xs'>
												拒绝
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			)}
		</div>
	)
}
