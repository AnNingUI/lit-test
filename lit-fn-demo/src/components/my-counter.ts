import { css, html } from "lit";
import {
	createComponent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "lit-fn";
import { ref } from "lit/directives/ref.js";

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
	button {
		background: #0078d4;
		color: white;
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		margin: 4px;
		cursor: pointer;
		transition: background 0.3s;
	}
	button:hover {
		background: #005a9e;
	}
	.controls {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 16px;
		align-items: center;
	}
	input {
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		width: 60px;
		text-align: center;
	}
	.history {
		margin-top: 16px;
		padding: 8px;
		background: #f5f5f5;
		border-radius: 4px;
		max-height: 150px;
		overflow-y: auto;
	}
	.history-item {
		padding: 4px 0;
		border-bottom: 1px solid #eee;
	}
`;

export const MyCounter = createComponent(
	(props: { step?: number }) => {
		const [count, setCount] = useState(0);
		const [step, setStep] = useState(props.step ?? 1);
		const [history, setHistory] = useState<string[]>([]);
		// const inputRef = useRef<HTMLInputElement | null>(null);
		const inputRef = useRef<HTMLInputElement>();

		useEffect(() => {
			console.log("Effect: mounted or updated", inputRef.current);
			return () => console.log("Effect: cleanup");
		}, [count]);

		const increment = useCallback(() => {
			const newCount = count + step;
			setCount(newCount);
			setHistory([...history, `Increased to ${newCount} (+${step})`]);
		}, [count, step, history]);

		const decrement = useCallback(() => {
			const newCount = count - step;
			setCount(newCount);
			setHistory([...history, `Decreased to ${newCount} (-${step})`]);
		}, [count, step, history]);

		const reset = useCallback(() => {
			setCount(0);
			setHistory([...history, "Reset to 0"]);
		}, [history]);

		const handleStepChange = useCallback(
			(e: Event) => {
				const input = e.target as HTMLInputElement;
				const newStep = parseInt(input.value) || 1;
				setStep(newStep);
				setHistory([...history, `Step changed to ${newStep}`]);
				input.value = newStep.toString();
			},
			[history]
		);

		const memoizedHistory = useMemo(() => {
			return history.length > 0
				? history.map((item) => html`<div class="history-item">${item}</div>`)
				: html`<div class="history-item">No history yet</div>`;
		}, [history]);

		const uuid = useId("step-input-");

		return html`
			<div>
				<h2>Counter</h2>
				<p>Count: <strong>${count}</strong></p>
				<p>Current step: ${step}</p>
				<div class="controls">
					<button @click=${decrement}>-${step}</button>
					<button @click=${increment}>+${step}</button>
					<button @click=${reset}>Reset</button>
				</div>
				<div class="controls">
					<label for="${uuid}">Custom step:</label>
					<input
						id="${uuid}"
						type="number"
						min="-100"
						value=${step}
						${ref((el) => (inputRef.current = el as HTMLInputElement))}
						@input=${handleStepChange}
						@change=${handleStepChange}
					/>
					<button
						@click=${() => {
							if (inputRef.current) {
								const newStep = parseInt(inputRef.current.value) || 1;
								setStep(newStep);
								setHistory([...history, `Step changed to ${newStep}`]);
								inputRef.current.value = newStep.toString();
							}
						}}
					>
						Apply
					</button>
				</div>
				<div class="history">
					<h3>History</h3>
					${memoizedHistory}
				</div>
			</div>
		`;
	},
	{ style, props: ["step"] }
);
