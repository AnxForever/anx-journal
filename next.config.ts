import { NextConfig } from 'next'
import { codeInspectorPlugin } from 'code-inspector-plugin'

const nextConfig: NextConfig = {
	devIndicators: false,
	reactStrictMode: false,
	reactCompiler: true,
	pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
	experimental: {
		scrollRestoration: false,
		optimizePackageImports: ['lucide-react', 'motion']
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js'
			}
			// ...codeInspectorPlugin({
			// 	bundler: 'turbopack'
			// })
		},

		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json', 'css']
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.svg$/i,
			use: [{ loader: '@svgr/webpack', options: { svgo: false } }]
		})

		return config
	},

	async redirects() {
		return [
			{
				source: '/zh',
				destination: '/',
				permanent: true
			},
			{
				source: '/en',
				destination: '/',
				permanent: true
			}
		]
	},

	async headers() {
		return [
			{
				source: '/blogs/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, stale-while-revalidate=604800'
					}
				]
			},
			{
				source: '/music/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=2592000, stale-while-revalidate=604800'
					}
				]
			},
			{
				source: '/images/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400, stale-while-revalidate=604800'
					}
				]
			},
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable'
					}
				]
			}
		]
	}
}

export default nextConfig
