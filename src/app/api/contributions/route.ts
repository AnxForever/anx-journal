import { GITHUB_CONFIG } from '@/consts'

// GitHub 贡献热力图数据源代理
// 优先走官方 GraphQL（GITHUB_CONTRIB_TOKEN，含私有仓库贡献计数），
// 失败则回退到 jogruber 公共 API（爬取公开主页，无 token）。
// 只返回非敏感的聚合计数，公开 GET 无需鉴权。

export const runtime = 'nodejs'
// 强制动态：避免 build 时预执行 fetch（小水管易超时）并把结果固化成静态响应；
// 新鲜度由下面的内存 TTL 控制。
export const dynamic = 'force-dynamic'

const GITHUB_USER = GITHUB_CONFIG.OWNER
const TOKEN = process.env.GITHUB_CONTRIB_TOKEN
const TTL = 6 * 60 * 60 * 1000 // 6 小时
const DAYS_WINDOW = 183 // 只回传最近 ~26 周，减小小水管传输体积

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type Payload = { username: string; total: number; days: Day[] }

let cached: { data: Payload; ts: number } | null = null

const LEVEL_MAP: Record<string, Day['level']> = {
	NONE: 0,
	FIRST_QUARTILE: 1,
	SECOND_QUARTILE: 2,
	THIRD_QUARTILE: 3,
	FOURTH_QUARTILE: 4
}

async function fetchViaGraphQL(): Promise<Payload> {
	const query = `query($login: String!) {
		user(login: $login) {
			contributionsCollection {
				contributionCalendar {
					totalContributions
					weeks { contributionDays { date contributionCount contributionLevel } }
				}
			}
		}
	}`

	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			Authorization: `bearer ${TOKEN}`,
			'Content-Type': 'application/json',
			'User-Agent': 'anx-journal'
		},
		body: JSON.stringify({ query, variables: { login: GITHUB_USER } })
	})

	if (!res.ok) throw new Error(`graphql ${res.status}`)
	const json = await res.json()
	if (json.errors) throw new Error(`graphql: ${json.errors[0]?.message ?? 'unknown'}`)

	const calendar = json.data?.user?.contributionsCollection?.contributionCalendar
	if (!calendar) throw new Error('graphql: empty calendar')

	const days: Day[] = calendar.weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
		w.contributionDays.map(d => ({ date: d.date, count: d.contributionCount, level: LEVEL_MAP[d.contributionLevel] ?? 0 }))
	)

	return { username: GITHUB_USER, total: calendar.totalContributions, days }
}

async function fetchViaJogruber(): Promise<Payload> {
	const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
	if (!res.ok) throw new Error(`jogruber ${res.status}`)
	const json = (await res.json()) as { total: Record<string, number>; contributions: Day[] }
	const total = json.total?.lastYear ?? Object.values(json.total ?? {}).reduce((a, b) => a + b, 0)
	return { username: GITHUB_USER, total, days: json.contributions ?? [] }
}

export async function GET() {
	if (cached && Date.now() - cached.ts < TTL) {
		return Response.json(cached.data, { headers: { 'Cache-Control': 'public, max-age=21600' } })
	}

	try {
		const raw = TOKEN ? await fetchViaGraphQL() : await fetchViaJogruber()
		const data: Payload = { ...raw, days: raw.days.slice(-DAYS_WINDOW) }
		cached = { data, ts: Date.now() }
		return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=21600' } })
	} catch (err) {
		// GraphQL 挂了再兜一层公共 API
		if (TOKEN) {
			try {
				const raw = await fetchViaJogruber()
				const data: Payload = { ...raw, days: raw.days.slice(-DAYS_WINDOW) }
				cached = { data, ts: Date.now() }
				return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=21600' } })
			} catch {
				/* 落到下面的陈旧兜底 */
			}
		}
		// 上游全挂：返回上次缓存（哪怕过期），实在没有就给空数据不报错
		if (cached) return Response.json(cached.data, { headers: { 'Cache-Control': 'public, max-age=600' } })
		const message = err instanceof Error ? err.message : 'unknown'
		return Response.json({ username: GITHUB_USER, total: 0, days: [], error: message }, { status: 200 })
	}
}
