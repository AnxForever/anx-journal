import { GuestbookSection } from '@/components/guestbook-section'

export default function GuestbookPage() {
	return (
		<div className='mx-auto max-w-[1140px] px-6 pt-28 pb-12 max-sm:px-0'>
			<div className='card bg-article static mb-6 rounded-xl p-8'>
				<div className='text-secondary text-[11px] tracking-[0.2em] uppercase'>Open Page</div>
				<h1 className='mt-3 text-3xl font-semibold'>给这座小站留点痕迹</h1>
				<p className='text-secondary mt-3 text-sm leading-6'>这里适合放随手的问候、合作招呼、路过的留言，和文章评论区不同，它更像一块独立的来访记录板。</p>
			</div>
			<GuestbookSection />
		</div>
	)
}
