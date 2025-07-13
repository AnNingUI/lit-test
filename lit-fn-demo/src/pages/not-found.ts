// src/pages/not-found.ts
import { css, html } from "lit";
import { defineComponent } from "lit-fn";

const style = css`
	.page {
		padding: 2rem;
		color: #c00;
	}
`;
export const NotFoundPage = defineComponent(
	"not-found",
	() => html`
		<div class="page">
			<h2>404 Not Found</h2>
			<p>页面不存在，请检查链接。</p>
		</div>
	`,
	{ style }
);
