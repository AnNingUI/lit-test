// src/App.ts
import { html, type TemplateResult } from "lit";
import { LoginPage } from "./pages/LoginPage";
import { TodoPage } from "./pages/TodoPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { Router, type Params } from "./router";

export function App(): TemplateResult {
	return html`
		<nav>
			<a href="#/">Todos</a>
			<a href="#/login">Login</a>
			<a href="#/user/42">User #42</a>
			<a href="#/files/images/logo.png">Files</a>
		</nav>
		<main>
			${Router({
				routes: [
					{
						path: "#/",
						render: (_params: Params) => TodoPage(),
					},
					{
						path: "#/login",
						render: (_params: Params) => LoginPage(),
					},
					{
						path: "#/user/:id",
						render: (params: Params) =>
							UserProfilePage({ userId: parseInt(params.id, 10) }),
					},
					{
						path: "#/files/*path",
						render: (params: Params) => {
							const path = params.path;
							return html`
								<section>
									<h2>Files under “${path}”</h2>
								</section>
							`;
						},
					},
				],
				default: (hash: string) => html`
					<section>
						<h2>404 Not Found</h2>
						<p>No match for <code>${hash}</code></p>
					</section>
				`,
			})}
		</main>
	`;
}
