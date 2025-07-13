// src/pages/about-page.ts
import { css, html } from "lit";
import { defineComponent } from "lit-fn";

const style = css`
	.page {
		padding: 2rem;
	}
`;
export const AboutPage = defineComponent(
	"about-page",
	() => html`
		<div class="page">
			<h2>About Me</h2>
			<p>这里是关于我的介绍。</p>
		</div>
	`,
	{ style }
);
