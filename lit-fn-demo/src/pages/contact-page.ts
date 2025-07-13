// src/pages/contact-page.ts
import { css, html } from "lit";
import { defineComponent } from "lit-fn";

const style = css`
	.page {
		padding: 2rem;
	}
`;
export const ContactPage = defineComponent(
	"contact-page",
	() => html`
		<div class="page">
			<h2>Contact</h2>
			<p>联系邮箱：you@example.com</p>
		</div>
	`,
	{ style }
);
