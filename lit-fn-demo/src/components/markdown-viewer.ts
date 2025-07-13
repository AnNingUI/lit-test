import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { css, html } from "lit";
import { defineComponent, useAsync, useState } from "lit-fn";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import highlightDark from "../style/css/catppuccin-mocha.css?inline"; // look [this](https://github.com/catppuccin/highlightjs)
const marked = new Marked(
	markedHighlight({
		emptyLangClass: "hljs",
		langPrefix: "hljs language-",
		highlight(code, lang, _) {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			return hljs.highlight(code, { language }).value;
		},
	})
);

const style = css`
	.markdown {
		line-height: 1.6;
		font-size: 1rem;
	}
	pre code.hljs {
		display: block;
		overflow-x: auto;
		padding: 1em;
	}
	code.hljs {
		padding: 3px 5px;
	}
`;

export const MarkdownViewer = defineComponent(
	"markdown-viewer",
	({ content = "", src }: { content?: string; src?: string }) => {
		const [state, setState] = useState({ html: "" });

		useAsync(async () => {
			let markdown = content;
			if (src) {
				try {
					const res = await fetch(src);
					if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
					markdown = await res.text();
				} catch (error) {
					console.error("Failed to fetch markdown content", error);
					// state.html = `<p>无法加载内容</p>`;
					setState((c) => {
						return { ...c, html: `<p>无法加载内容</p>` };
					});
				}
			}

			const dirty = await marked.parse(markdown, { silent: true });
			// state.html = DOMPurify.sanitize(dirty); // 确保异步处理完成
			setState((c) => {
				return { ...c, html: DOMPurify.sanitize(dirty) };
			});
		}, {});
		return html`<div class="markdown">${unsafeHTML(state.html)}</div>`;
	},
	{ style: [highlightDark, style], props: ["content", "src"] }
);
