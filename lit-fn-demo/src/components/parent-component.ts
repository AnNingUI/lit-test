import { css, html } from "lit";
import { createComponent, useState } from "lit-fn";

const style = css`
	div {
		font-family: sans-serif;
		max-width: 400px;
		margin: 0 auto;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		text-align: center;
	}
`;

export const ParentComponent = createComponent(
	(props: { initialCount?: number }) => {
		const [count, setCount] = useState(props.initialCount ?? 0);

		const increment = () => setCount(count + 1);

		const decrement = () => setCount(count - 1);

		return html`
			<div>
				<h2>Parent Component</h2>
				<p>Current Count: <strong>${count}</strong></p>
				<div>
					<button @click=${increment}>Increment</button>
					<button @click=${decrement}>Decrement</button>
				</div>
				<child-component
					.count=${count}
					.setCount=${setCount}
				></child-component>
			</div>
		`;
	},
	{ style, props: ["initialCount"] }
);
