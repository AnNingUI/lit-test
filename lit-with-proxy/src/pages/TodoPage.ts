import { html } from "lit";
import { TodoInput } from "../components/TodoInput";
import { TodoList } from "../components/TodoList";

export function TodoPage() {
	return html`
		<section>
			<h2>My Todos</h2>
			${TodoInput()} ${TodoList()}
		</section>
	`;
}
