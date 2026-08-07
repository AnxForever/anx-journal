import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, type TreeItem } from '@/lib/github-client'
import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import { prepareBlogsIndex } from '@/lib/blog-index'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import type { ImageItem } from '../types'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDateTimeLocal } from '../stores/write-store'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_COVER_BYTES = 200 * 1024
const MAX_CONTENT_IMAGE_BYTES = 2 * 1024 * 1024
const COVER_RATIO = 5 / 3
const COVER_RATIO_TOLERANCE = 0.03

export type PushBlogParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

function formatBytes(bytes: number): string {
	return `${Math.round(bytes / 1024)}KB`
}

function ensureValidDate(value?: string): void {
	if (!value) return
	if (Number.isNaN(new Date(value).getTime())) {
		throw new Error('发布时间格式不正确')
	}
}

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
	const objectUrl = URL.createObjectURL(file)

	try {
		const image = new Image()
		image.decoding = 'async'
		const loaded = new Promise<void>((resolve, reject) => {
			image.onload = () => resolve()
			image.onerror = () => reject(new Error('无法读取图片尺寸'))
		})
		image.src = objectUrl
		await loaded

		return {
			width: image.naturalWidth,
			height: image.naturalHeight
		}
	} finally {
		URL.revokeObjectURL(objectUrl)
	}
}

async function validatePublishInput({ form, cover, images, mode, originalSlug }: PushBlogParams): Promise<void> {
	const slug = form.slug.trim()
	const title = form.title.trim()
	const markdown = form.md.trim()

	if (!slug) throw new Error('需要 slug')
	if (form.slug !== slug) throw new Error('slug 前后不能有空格')
	if (!SLUG_PATTERN.test(slug)) throw new Error('slug 只能使用小写字母、数字和中划线，且不能以中划线开头或结尾')
	if (!title) throw new Error('需要文章标题')
	if (!markdown) throw new Error('需要文章正文')

	ensureValidDate(form.date)

	if (mode === 'edit' && originalSlug && originalSlug !== slug) {
		throw new Error('编辑模式下不支持修改 slug，请保持原 slug 不变')
	}

	if (cover?.type === 'file') {
		if (cover.file.size > MAX_COVER_BYTES) {
			throw new Error(`封面图片过大：${formatBytes(cover.file.size)}，建议不超过 ${formatBytes(MAX_COVER_BYTES)}`)
		}

		const size = await readImageSize(cover.file)
		if (!size.width || !size.height) throw new Error('无法读取封面尺寸')
		if (size.width < 400 || size.height < 240) {
			throw new Error(`封面尺寸过小：${size.width}x${size.height}，建议至少 400x240`)
		}

		const ratio = size.width / size.height
		if (Math.abs(ratio - COVER_RATIO) > COVER_RATIO_TOLERANCE) {
			throw new Error(`封面比例不合适：${size.width}x${size.height}，建议使用 5:3 比例`)
		}
	}

	for (const image of images || []) {
		if (image.type === 'file' && image.file.size > MAX_CONTENT_IMAGE_BYTES) {
			throw new Error(`正文图片 ${image.file.name} 过大：${formatBytes(image.file.size)}，建议不超过 ${formatBytes(MAX_CONTENT_IMAGE_BYTES)}`)
		}
	}
}

export async function pushBlog(params: PushBlogParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	await validatePublishInput(params)

	// 获取认证 token（自动从全局认证状态获取）
	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const basePath = `public/blogs/${form.slug}`
	const commitMessage = mode === 'edit' ? `更新文章: ${form.slug}` : `新增文章: ${form.slug}`

	// collect all local images (content + cover)
	const allLocalImages: Array<{ img: Extract<ImageItem, { type: 'file' }>; id: string }> = []

	// add content images
	for (const img of images || []) {
		if (img.type === 'file') {
			allLocalImages.push({ img, id: img.id })
		}
	}

	// add cover if local
	if (cover?.type === 'file') {
		allLocalImages.push({ img: cover, id: cover.id })
	}

	toast.info('正在准备文件...')

	const uploadedHashes = new Set<string>()
	let mdToUpload = form.md
	let coverPath: string | undefined

	// prepare tree items for all files
	const treeItems: TreeItem[] = []

	// process all images
	if (allLocalImages.length > 0) {
		toast.info('正在上传图片...')
		for (const { img, id } of allLocalImages) {
			const hash = img.hash || (await hashFileSHA256(img.file))
			const ext = getFileExt(img.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/blogs/${form.slug}/${filename}`

			if (!uploadedHashes.has(hash)) {
				const path = `${basePath}/${filename}`
				const contentBase64 = await fileToBase64NoPrefix(img.file)
				// create blob for image
				const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
				treeItems.push({
					path,
					mode: '100644',
					type: 'blob',
					sha: blobData.sha
				})
				uploadedHashes.add(hash)
			}

			// replace placeholder in markdown
			const placeholder = `local-image:${id}`
			mdToUpload = mdToUpload.split(`(${placeholder})`).join(`(${publicPath})`)

			// set cover path if this is the cover
			if (cover?.type === 'file' && cover.id === id) {
				coverPath = publicPath
			}
		}
	}

	// handle external cover URL
	if (cover?.type === 'url') {
		coverPath = cover.url
	}

	toast.info('正在创建文件...')

	// create blob for index.md
	const mdBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(mdToUpload), 'base64')
	treeItems.push({
		path: `${basePath}/index.md`,
		mode: '100644',
		type: 'blob',
		sha: mdBlob.sha
	})

	// create blob for config.json
	const dateStr = form.date || formatDateTimeLocal()
	const config = {
		title: form.title,
		tags: form.tags,
		date: dateStr,
		summary: form.summary,
		cover: coverPath,
		hidden: form.hidden,
		category: form.category
	}

	const configBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(JSON.stringify(config, null, 2)), 'base64')
	treeItems.push({
		path: `${basePath}/config.json`,
		mode: '100644',
		type: 'blob',
		sha: configBlob.sha
	})

	// prepare and create blob for blogs index
	const indexJson = await prepareBlogsIndex(
		token,
		GITHUB_CONFIG.OWNER,
		GITHUB_CONFIG.REPO,
		{
			slug: form.slug,
			title: form.title,
			tags: form.tags,
			date: dateStr,
			summary: form.summary,
			cover: coverPath,
			hidden: form.hidden,
			category: form.category
		},
		GITHUB_CONFIG.BRANCH
	)
	const indexBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(indexJson), 'base64')
	treeItems.push({
		path: 'public/blogs/index.json',
		mode: '100644',
		type: 'blob',
		sha: indexBlob.sha
	})

	// create tree
	toast.info('正在创建文件树...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)

	// create commit
	toast.info('正在创建提交...')
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, treeData.sha, [latestCommitSha])

	// update branch reference
	toast.info('正在更新分支...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('发布成功！')
}
