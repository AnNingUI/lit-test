import type { TemplateResult } from "lit";
import { html } from "lit";
import { authStore } from "../store";

export function UserProfilePage({
	userId,
}: {
	userId: number;
}): TemplateResult {
	return html`
		<section>
			<h2>User Profile</h2>
			<p>User ID: ${userId}</p>
			<p>Logged in: ${authStore.view((s) => html`${s.user}`)}</p>
		</section>
	`;
}
