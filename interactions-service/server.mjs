import Fastify from 'fastify'
import mysql from 'mysql2/promise'
import { createHash } from 'node:crypto'

const app = Fastify({ logger: true })

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60_000,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true
})

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function sanitizeSlug(value = '') {
  return value.trim().toLowerCase()
}

function normalizeOptionalString(value) {
  if (!value) return null
  const normalized = String(value).trim()
  return normalized ? normalized : null
}

function normalizeWebsite(value) {
  const normalized = normalizeOptionalString(value)
  if (!normalized) return null
  if (/^https?:\/\//i.test(normalized)) {
    return normalized
  }
  return `https://${normalized}`
}

function hashIp(ip = 'unknown') {
  return createHash('sha256').update(ip).digest('hex')
}

function validatePayload(body) {
  const nickname = normalizeOptionalString(body?.nickname)
  const content = normalizeOptionalString(body?.content)
  if (!nickname || nickname.length > 80 || !content || content.length > 1200) {
    return null
  }

  const email = normalizeOptionalString(body?.email)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null
  }

  return {
    nickname,
    content,
    email,
    website: normalizeWebsite(body?.website)
  }
}

app.get('/health', async () => ({ ok: true }))

app.get('/likes/:slug', async (request, reply) => {
  const slug = sanitizeSlug(request.params.slug)
  const visitorId = normalizeOptionalString(request.headers['x-visitor-id'])

  if (!slug || !SLUG_RE.test(slug) || !visitorId) {
    return reply.code(400).send({ error: 'Invalid slug or visitor' })
  }

  const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM likes WHERE post_slug = ?', [slug])
  const [likedRows] = await pool.query('SELECT id FROM likes WHERE post_slug = ? AND visitor_id = ? LIMIT 1', [slug, visitorId])

  return {
    count: Number(countRows[0]?.count || 0),
    liked: likedRows.length > 0
  }
})

app.post('/likes/:slug', async (request, reply) => {
  const slug = sanitizeSlug(request.params.slug)
  const visitorId = normalizeOptionalString(request.headers['x-visitor-id'])

  if (!slug || !SLUG_RE.test(slug) || !visitorId) {
    return reply.code(400).send({ error: 'Invalid slug or visitor' })
  }

  await pool.query('INSERT IGNORE INTO likes (post_slug, visitor_id) VALUES (?, ?)', [slug, visitorId])
  const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM likes WHERE post_slug = ?', [slug])

  return {
    count: Number(countRows[0]?.count || 0),
    liked: true
  }
})

app.get('/comments/:slug', async (request, reply) => {
  const slug = sanitizeSlug(request.params.slug)
  if (!slug || !SLUG_RE.test(slug)) {
    return reply.code(400).send({ error: 'Invalid slug' })
  }

  const [rows] = await pool.query(
    `SELECT id, nickname, content, website, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM comments
     WHERE post_slug = ? AND status = 'approved'
     ORDER BY created_at DESC
     LIMIT 100`,
    [slug]
  )

  return {
    comments: rows.map(row => ({
      id: Number(row.id),
      nickname: String(row.nickname),
      content: String(row.content),
      website: row.website ? String(row.website) : null,
      createdAt: String(row.createdAt)
    }))
  }
})

app.post('/comments/:slug', async (request, reply) => {
  const slug = sanitizeSlug(request.params.slug)
  if (!slug || !SLUG_RE.test(slug)) {
    return reply.code(400).send({ error: 'Invalid slug' })
  }

  const payload = validatePayload(request.body)
  if (!payload) {
    return reply.code(400).send({ error: 'Invalid payload' })
  }

  const ipHash = hashIp(String(request.headers['x-forwarded-for'] || request.ip || 'unknown'))
  const [recentRows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM comments
     WHERE ip_hash = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
    [ipHash]
  )

  if (Number(recentRows[0]?.count || 0) >= 3) {
    return reply.code(429).send({ error: 'Too many requests, please wait a bit.' })
  }

  const [result] = await pool.query(
    `INSERT INTO comments (post_slug, nickname, content, email, website, status, ip_hash)
     VALUES (?, ?, ?, ?, ?, 'approved', ?)`,
    [slug, payload.nickname, payload.content, payload.email, payload.website, ipHash]
  )

  const [rows] = await pool.query(
    `SELECT id, nickname, content, website, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM comments
     WHERE id = ?
     LIMIT 1`,
    [result.insertId]
  )

  const comment = rows[0]
  return {
    comment: {
      id: Number(comment.id),
      nickname: String(comment.nickname),
      content: String(comment.content),
      website: comment.website ? String(comment.website) : null,
      createdAt: String(comment.createdAt)
    }
  }
})

app.get('/guestbook', async () => {
  const [rows] = await pool.query(
    `SELECT id, nickname, content, website, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM guestbook_entries
     WHERE status = 'approved'
     ORDER BY created_at DESC
     LIMIT 100`
  )

  return {
    entries: rows.map(row => ({
      id: Number(row.id),
      nickname: String(row.nickname),
      content: String(row.content),
      website: row.website ? String(row.website) : null,
      createdAt: String(row.createdAt)
    }))
  }
})

app.post('/guestbook', async (request, reply) => {
  const payload = validatePayload(request.body)
  if (!payload) {
    return reply.code(400).send({ error: 'Invalid payload' })
  }

  const ipHash = hashIp(String(request.headers['x-forwarded-for'] || request.ip || 'unknown'))
  const [recentRows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM guestbook_entries
     WHERE ip_hash = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
    [ipHash]
  )

  if (Number(recentRows[0]?.count || 0) >= 3) {
    return reply.code(429).send({ error: 'Too many requests, please wait a bit.' })
  }

  const [result] = await pool.query(
    `INSERT INTO guestbook_entries (nickname, content, email, website, status, ip_hash)
     VALUES (?, ?, ?, ?, 'approved', ?)`,
    [payload.nickname, payload.content, payload.email, payload.website, ipHash]
  )

  const [rows] = await pool.query(
    `SELECT id, nickname, content, website, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM guestbook_entries
     WHERE id = ?
     LIMIT 1`,
    [result.insertId]
  )

  const entry = rows[0]
  return {
    entry: {
      id: Number(entry.id),
      nickname: String(entry.nickname),
      content: String(entry.content),
      website: entry.website ? String(entry.website) : null,
      createdAt: String(entry.createdAt)
    }
  }
})

const port = Number(process.env.PORT || 8787)

app.listen({ host: '127.0.0.1', port }).catch(error => {
  app.log.error(error)
  process.exit(1)
})
