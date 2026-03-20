import { Fragment, type ReactElement } from 'react'
import parse, { type HTMLReactParserOptions, Element, type DOMNode } from 'html-react-parser'
import { MarkdownImage } from '@/components/markdown-image'
import { CodeBlock } from '@/components/code-block'

export function renderMarkdownHtmlToReact(html: string): ReactElement | null {
	if (!html) return null

	const codeBlocks: Array<{ placeholder: string; code: string; preHtml: string }> = []
	const processedHtml = html.replace(/<pre\s+data-code="([^"]*)"([^>]*)>([\s\S]*?)<\/pre>/g, (_match, codeAttr, _attrs, content) => {
		const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
		const code = codeAttr
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')

		codeBlocks.push({
			placeholder,
			code,
			preHtml: `${content}`
		})

		return placeholder
	})

	const options: HTMLReactParserOptions = {
		replace(domNode: DOMNode) {
			if (domNode instanceof Element && domNode.name === 'img') {
				const { src, alt, title } = domNode.attribs
				return <MarkdownImage src={src} alt={alt} title={title} />
			}

			if (domNode.type === 'text' && domNode.data && domNode.data.includes('__CODE_BLOCK_')) {
				return (
					<>
						{domNode.data
							.split(/(__CODE_BLOCK_\d+__)/)
							.filter(Boolean)
							.map((item, index) => {
								if (!item.startsWith('__CODE_BLOCK_')) {
									return item ? <Fragment key={index}>{item}</Fragment> : null
								}

								const block = codeBlocks.find(candidate => candidate.placeholder === item)
								if (!block) return null

								const preElement = parse(block.preHtml) as ReactElement
								return (
									<CodeBlock key={block.placeholder} code={block.code}>
										{preElement}
									</CodeBlock>
								)
							})}
					</>
				)
			}
		}
	}

	return parse(processedHtml, options) as ReactElement
}
