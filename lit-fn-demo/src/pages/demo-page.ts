import { css, html } from "lit";
import { defineComponent } from "lit-fn";
import "../components/app-header";
import "../components/info-card";
import "../components/markdown-viewer";
import "../components/theme-button";
import "../components/theme-display";

const pageStyle = css`
	.container {
		max-width: 960px;
		margin: 2rem auto;
		padding: 0 1rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}
`;

export const DemoPage = defineComponent(
	"demo-page",
	() => html`
		<div class="container">
			<theme-display></theme-display>
			<theme-button></theme-button>
			<parent-component></parent-component>
			<my-counter></my-counter>
			<markdown-viewer
				.src=${"https://raw.githubusercontent.com/AnNingUI/lit-fn/main/README.md"}
			></markdown-viewer>

			<div class="cards">
				<info-card
					.title=${"Fast Performance"}
					.text=${"Powered by Vite, Lit and TypeScript for instant feedback and lightning load times."}
				></info-card>
				<info-card
					.title=${"Reactive UI"}
					.text=${"Context-driven theme switching and stateful components made simple."}
				></info-card>
				<info-card
					.title=${"Modern Design"}
					.text=${"Clean, responsive layouts with smooth transitions and animations."}
				></info-card>
			</div>
		</div>
	`,
	{ style: pageStyle }
);
