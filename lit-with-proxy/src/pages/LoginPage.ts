import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { authStore } from "../store";
const { Msg } = authStore;

export function LoginPage() {
	const input: { ref: HTMLInputElement | null } = {
		ref: null,
	};
	const onLogin = () => authStore.upload(Msg.Login, input.ref?.value);
	ref;
	return html`
		<section>
			<h2>Login</h2>
			<input
				type="text"
				placeholder="Your name"
				${ref((el) => (input.ref = el as HTMLInputElement))}
			/>
			<button @click=${onLogin}>Login</button>
			${authStore.view((state) => {
				return state.user ? html`Welcome ${state.user}` : html``;
			})}
		</section>
	`;
}
