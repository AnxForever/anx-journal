'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<div className='flex min-h-[50dvh] flex-col items-center justify-center gap-4'>
			<p className='text-secondary text-sm'>加载失败，请稍后重试</p>
			<button onClick={reset} className='brand-btn px-4 py-2 text-xs'>
				重试
			</button>
		</div>
	)
}
