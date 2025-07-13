import { html, render } from "lit";
import { ref } from "lit/directives/ref.js";
import { state } from "./utils/_";

type Todo = { id: number; text: string };
const todos = state<Todo[]>([]);

const withMsg = todos.msg(["Add", "Remove"] as const);
const { Msg } = withMsg;

withMsg.update({
	Add: (list, payload: string) => [
		...list,
		{ id: Date.now(), text: payload.trim() },
	],
	Remove: (list, payload: number) => list.filter((todo) => todo.id !== payload),
});

const TodoListView = withMsg.view(
	(list) => html`
		<ul>
			${list.map(
				(todo) => html`
					<li>
						${todo.text}
						<button @click=${() => withMsg.upload(Msg.Remove, todo.id)}>
							❌
						</button>
					</li>
				`
			)}
		</ul>
	`
);

const InputView = () => {
	let inputValue = "";

	let inputEl: HTMLInputElement;

	const handleInput = (e: Event) => {
		inputValue = (e.target as HTMLInputElement).value;
	};
	const handleAdd = () => {
		if (inputValue.trim()) {
			withMsg.upload(Msg.Add, inputValue);
			inputEl.value = "";
			inputValue = "";
		}
	};

	return html`
		<input
			name="todo"
			type="text"
			placeholder="Add todo"
			@input=${handleInput}
			${ref((el) => (inputEl = el as HTMLInputElement))}
		/>
		<button @click=${handleAdd}>Add</button>
	`;
};

function main() {
	const app = document.getElementById("app")!;
	render(
		html`
			<h1>Todo List</h1>
			${InputView()} ${TodoListView}
		`,
		app
	);
}
main();
