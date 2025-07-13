import { css, html } from "lit";
import { defineComponent } from "lit-fn";

const cardStyle = css`
	.card {
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-width: 300px;
		transition: transform 0.2s;
	}
	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}
	.card h3 {
		margin-top: 0;
		font-size: 1.25rem;
	}
	.card p {
		margin-bottom: 0;
		line-height: 1.4;
	}
`;

export const InfoCard = defineComponent(
	"info-card",
	({ title, text }: { title: string; text: string }) => html`
		<div class="card">
			<h3>${title}</h3>
			<p>${text}</p>
		</div>
	`,
	{ style: cardStyle, props: ["text", "title"] }
);
