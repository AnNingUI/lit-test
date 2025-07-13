import { css, html } from "lit";
import { createComponent, useCallback, useMemo } from "lit-fn";

const style = css`
	div {
		margin-top: 20px;
		padding: 15px;
		background: #f0f0f0;
		border-radius: 6px;
	}
	button {
		background: #4caf50;
		color: white;
		padding: 6px 12px;
		border: none;
		border-radius: 4px;
		margin: 4px;
		cursor: pointer;
	}
	button:hover {
		background: #45a049;
	}
`;

export const ChildComponent = createComponent(
	(props: { count: number; setCount: (value: number) => void }) => {
		const doubleCount = useMemo(() => props.count * 2, [props.count]);

		const increment = useCallback(() => {
			props.setCount(props.count + 1);
		}, [props.count]);

		const decrement = useCallback(() => {
			props.setCount(props.count - 1);
		}, [props.count]);

		return html`
			<div>
				<h3>Child Component</h3>
				<p>Count: ${props.count}</p>
				<p>Double Count: ${doubleCount}</p>
				<div>
					<button @click=${increment}>Child Increment</button>
					<button @click=${decrement}>Child Decrement</button>
				</div>
			</div>
		`;
	},
	{ style, props: ["count", "setCount"] }
);
