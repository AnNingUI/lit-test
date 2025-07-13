import { computed, signal } from "alien-signals";
import { css, html } from "lit";
import { onMounted, onUnmounted, render, useCss } from "./_index";
const count = signal(0);
const doubled = computed(() => count() * 2);
function CounterText() {
	return () => html`
		<div>
			<p>The count is ${count()}</p>
			<p>The doubled count is ${doubled()}</p>
			<slot></slot>
		</div>
	`;
}

const Counter = (props: { initValue?: number }) => {
	useCss(css`
		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		button {
			margin: 0.5rem;
			padding: 0.5rem;
			font-size: 1.2rem;
			background-color: #4caf50;
			color: white;
			border: none;
			border-radius: 0.2rem;
		}
	`);
	return () => html`
		<button
			@click=${() => {
				count(count() + 1 + (props?.initValue ?? 0));
			}}
		>
			Increment
		</button>
		<fn-component .component=${CounterText}></fn-component>
	`;
};

const inlineCounter = () => {
	const inlineCount = signal(0);
	onMounted(() => {
		console.log("inlineCounter mounted");
	});
	onUnmounted(() => {
		console.log("inlineCounter unmounted");
	});
	return () => html`
		<button
			@click=${() => {
				inlineCount(inlineCount() + 1);
			}}
		>
			Inline Counter: ${inlineCount()}
		</button>
	`;
};

const App = () => {
	const isLoad = signal(true);

	return () => html`
		<fn-component
			.component=${Counter}
			.props=${{ initValue: 10 }}
		></fn-component>
		<fn-component .component=${inlineCounter}></fn-component>
		<button @click=${() => isLoad(!isLoad())}>Toggle Component</button>
		${isLoad()
			? html`<fn-component .component=${inlineCounter}></fn-component>`
			: ""}
	`;
};
render(App, document.body);
