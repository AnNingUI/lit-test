import { Router } from "@vaadin/router";
import { css, html } from "lit";
import { defineComponent, useState } from "lit-fn";

const headerStyle = css`
	header {
		padding: 1rem 2rem;
		background: linear-gradient(90deg, #4b6cb7, #182848);
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 0 0 1rem 1rem;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	nav a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		margin-left: 1rem;
		transition: color 0.2s;
	}
	nav a:hover {
		color: white;
	}
`;

export const AppHeader = defineComponent(
	"app-header",
	(props: { title: string }) => {
		const [title, _] = useState(props.title ?? "");
		return html`
			<header>
				<h1>${title}</h1>
				<nav>
					<a
						@click=${(e: MouseEvent) => {
							e.preventDefault();
							Router.go("/");
						}}
						>Home</a
					>
					<a
						@click=${(e: MouseEvent) => {
							e.preventDefault();
							Router.go("/about");
						}}
						>About</a
					>
					<a
						@click=${(e: MouseEvent) => {
							e.preventDefault();
							Router.go("/contact");
						}}
						>Contact</a
					>
					<a
						@click=${(e: MouseEvent) => {
							e.preventDefault();
							Router.go("/demo");
						}}
						>Demo</a
					>
					<a
						@click=${(e: MouseEvent) => {
							e.preventDefault();
							Router.go("/game");
						}}
						>Game</a
					>
				</nav>
			</header>
		`;
	},
	{ style: headerStyle, props: ["title"] }
);
