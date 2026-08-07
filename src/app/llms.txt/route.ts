import blogIndex from '@/../public/blogs/index.json'
import { getSiteOrigin } from '@/lib/site-url'

export const dynamic = 'force-static'

export function GET(): Response {
	const origin = getSiteOrigin()
	const articles = blogIndex
		.filter(item => item && !item.hidden)
		.map(item => `- [${item.title}](${origin}/blog/${item.slug}): ${item.summary || ''}`)
		.join('\n')

	const body = `# AnxForever

> AnxForever 的前端设计与 AI 编程博客，内容涵盖 UI 设计风格、网页设计提示词、设计系统、Cursor、Claude Code、Codex 和 StyleKit。

## Core product

- [StyleKit](https://stylekit.top): 面向 AI 编码工作流的 UI 设计风格、前端提示词与设计系统平台。
- [StyleKit styles](https://stylekit.top/styles): 浏览 UI 与网页设计风格。
- [StyleKit prompts](https://stylekit.top/prompts): 获取 AI 前端与 UI 设计提示词。

## Articles

${articles}
`

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
