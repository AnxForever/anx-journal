import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const BLOG_INDEX_PATH = path.join(ROOT, 'public', 'blogs', 'index.json')
const MAX_COVER_BYTES = 200 * 1024
const EXPECTED_COVER = { width: 400, height: 240 }

function readPngSize(filePath) {
	const buffer = fs.readFileSync(filePath)
	const pngSignature = '89504e470d0a1a0a'
	if (buffer.subarray(0, 8).toString('hex') !== pngSignature) return null

	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	}
}

function formatBytes(bytes) {
	return `${Math.round(bytes / 1024)}KB`
}

const index = JSON.parse(fs.readFileSync(BLOG_INDEX_PATH, 'utf8'))
const failures = []

for (const item of index) {
	if (!item || item.hidden || !item.cover || /^https?:\/\//i.test(item.cover)) continue

	const coverPath = path.join(ROOT, 'public', item.cover.replace(/^\/+/, ''))
	if (!fs.existsSync(coverPath)) {
		failures.push(`${item.slug}: missing cover ${item.cover}`)
		continue
	}

	const stat = fs.statSync(coverPath)
	if (stat.size > MAX_COVER_BYTES) {
		failures.push(`${item.slug}: cover is ${formatBytes(stat.size)}, expected <= ${formatBytes(MAX_COVER_BYTES)}`)
	}

	const size = readPngSize(coverPath)
	if (size && (size.width !== EXPECTED_COVER.width || size.height !== EXPECTED_COVER.height)) {
		failures.push(`${item.slug}: cover is ${size.width}x${size.height}, expected ${EXPECTED_COVER.width}x${EXPECTED_COVER.height}`)
	}
}

if (failures.length) {
	console.error('Blog image check failed:')
	for (const failure of failures) console.error(`- ${failure}`)
	process.exit(1)
}

console.log('Blog image check passed.')
