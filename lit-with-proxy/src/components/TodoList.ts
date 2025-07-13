import { html } from "lit";
import { todoStore } from "../store";
const { Msg } = todoStore;

export function TodoList() {
	return todoStore.view(
		(list) => html`
			<ul>
				${list.map(
					(todo) => html`
						<li>
							<input
								type="checkbox"
								?checked=${todo.done}
								@change=${() => {}}
							/>
							${todo.text}
							<button @click=${() => todoStore.upload(Msg.Remove, todo.id)}>
								❌
							</button>
						</li>
					`
				)}
			</ul>
		`
	);
}
