import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import { Averia_Gruesa_Libre } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'
import { getSiteOrigin } from '@/lib/site-url'

const averiaGruesa = Averia_Gruesa_Libre({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-averia'
})

const {
	meta: { title, description },
	theme
} = siteContent
const enableVercelAnalytics = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true'
const siteOrigin = getSiteOrigin()

export const viewport: Viewport = {
	viewportFit: 'cover'
}

export const metadata: Metadata = {
	metadataBase: new URL(siteOrigin),
	title: {
		default: `${title}｜前端设计、UI 风格与 AI 编程`,
		template: `%s｜${title}`
	},
	description,
	keywords: ['前端设计', 'UI 设计', '网页设计', 'UI 设计风格', 'AI 前端', '提示词', '设计系统', 'StyleKit', 'Cursor', 'Claude Code', 'Codex'],
	alternates: { canonical: siteOrigin },
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
	},
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

const htmlStyle = {
	cursor: 'url(/images/cursor.svg) 2 1, auto',
	'--color-brand': theme.colorBrand,
	'--color-primary': theme.colorPrimary,
	'--color-secondary': theme.colorSecondary,
	'--color-brand-secondary': theme.colorBrandSecondary,
	'--color-bg': theme.colorBg,
	'--color-border': theme.colorBorder,
	'--color-card': theme.colorCard,
	'--color-article': theme.colorArticle
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const entityGraph = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Person',
				'@id': `${siteOrigin}/#person`,
				name: 'AnxForever',
				url: siteOrigin,
				sameAs: ['https://github.com/AnxForever', 'https://stylekit.top'],
				knowsAbout: ['前端设计', 'UI 设计风格', '网页设计提示词', '设计系统', 'AI 编程', 'Cursor', 'Claude Code', 'Codex']
			},
			{
				'@type': 'WebSite',
				'@id': `${siteOrigin}/#website`,
				url: siteOrigin,
				name: 'AnxForever',
				description,
				inLanguage: 'zh-CN',
				publisher: { '@id': `${siteOrigin}/#person` },
				about: { '@id': 'https://stylekit.top/#softwareapplication' }
			},
			{
				'@type': 'SoftwareApplication',
				'@id': 'https://stylekit.top/#softwareapplication',
				name: 'StyleKit',
				url: 'https://stylekit.top',
				applicationCategory: 'DesignApplication',
				description: '面向 AI 编码工作流的 UI 设计风格、前端提示词与设计系统平台。',
				author: { '@id': `${siteOrigin}/#person` }
			}
		]
	}

	return (
		<html lang='zh-CN' data-scroll-behavior='smooth' suppressHydrationWarning style={htmlStyle} className={averiaGruesa.variable}>
			<Head />

			<body>
				<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraph) }} />
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<Layout>{children}</Layout>
				{enableVercelAnalytics && <Analytics />}
			</body>
		</html>
	)
}
