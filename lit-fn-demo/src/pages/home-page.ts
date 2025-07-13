// src/pages/home-page.ts
import { css, html } from "lit";
import { defineComponent } from "lit-fn";

const style = css`
	.page {
		padding: 2rem;
	}
`;
export const HomePage = defineComponent(
	"home-page",
	() => html`
		<div class="page">
			<h2>Welcome to My Intro Site</h2>
			<p>这是主页，使用 Vaadin Router + Lit-fn 构建。</p>
		</div>
	`,
	{ style }
);
