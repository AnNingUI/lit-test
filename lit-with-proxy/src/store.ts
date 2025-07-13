import { state } from "./utils/_";

export type Todo = { id: number; text: string; done: boolean };

export const todoStore = state<Todo[]>([]).msg(["Add", "Remove"] as const);
export type TodoMsg = (typeof todoStore)["Msg"];

todoStore.update({
	Add: (list, payload: string) => [
		...list,
		{ id: Date.now(), text: payload.trim(), done: false },
	],
	Remove: (list, payload: number) => list.filter((t) => t.id !== payload),
});

export const authStore = state<{ user: string | null }>({ user: null }).msg([
	"Login",
	"Logout",
] as const);
export type AuthMsg = (typeof authStore)["Msg"];

authStore.update({
	Login: (_, payload: string) => ({ user: payload }),
	Logout: () => ({ user: null }),
});
