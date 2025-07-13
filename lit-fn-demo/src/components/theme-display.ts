import { css, html } from "lit";
import { defineComponent, useContext, useState } from "lit-fn";
import { ThemeContext } from "../context";
// Display 组件样式
const displayStyle = css`
	.theme-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		transition: background-color 0.3s;
		padding: 2rem;
		border-radius: 1rem;
	}
	.theme-display.light {
		background-color: #f0f0f0;
		color: #222;
	}
	.theme-display.dark {
		background-color: #1a1a1a;
		color: #eee;
	}
	.title {
		font-size: 2rem;
		margin-bottom: 1rem;
	}
`;

// 简单计数器组件
const counter = () => {
	const [count, setCount] = useState(0);
	return html`
		<div>
			<h2>Counter</h2>
			<button
				@click=${() => setCount(count + 1)}
				style="padding: 0.5rem 1rem; font-size: 1rem; margin-bottom: 0.5rem;"
			>
				Increment
			</button>
			<p>Count: ${count}</p>
		</div>
	`;
};

export const ThemeDisplay = defineComponent(
	"theme-display",
	() => {
		const theme = useContext(ThemeContext);

		return html`
			<div class="theme-display ${theme}">
				<div class="title">Current Theme: ${theme}</div>
				${counter()}
			</div>
		`;
	},
	{ style: displayStyle }
);
