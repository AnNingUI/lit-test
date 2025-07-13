import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { todoStore } from "../store";
const { Msg } = todoStore;

export function TodoInput() {
	let inputVal = "";
	let inputEl: HTMLInputElement;
	const onInput = (e: Event) =>
		(inputVal = (e.target as HTMLInputElement).value);
	const onAdd = () => {
		if (inputVal.trim()) {
			todoStore.upload(Msg.Add, inputVal);
			inputEl.value = "";
			inputVal = "";
		}
	};
	return html`
		<div>
			<input
				type="text"
				placeholder="New todo"
				@input=${onInput}
				${ref((el) => (inputEl = el as HTMLInputElement))}
			/>
			<button @click=${onAdd}>Add</button>
		</div>
	`;
}
