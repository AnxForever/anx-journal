export default function Loading() {
	return (
		<div className='flex min-h-[50dvh] items-center justify-center'>
			<div className='flex flex-col items-center gap-3'>
				<div className='bg-brand h-8 w-8 animate-spin rounded-full border-2 border-transparent' style={{ borderRightColor: 'white' }} />
				<span className='text-secondary text-sm'>加载中...</span>
			</div>
		</div>
	)
}
