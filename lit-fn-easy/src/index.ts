import {
	$mount,
	clearCtx,
	computed,
	createRef,
	getOrPushCtx,
	getPrevSibling,
	h,
	nothing,
	onMounted,
	onUnmounted,
	raw,
	ref,
	state,
	u,
} from "./runtime";
const count = state(0);
const doubled = computed(() => count() * 2);
function CounterText() {
	return raw`
		<div>
			<p>The count is ${count}</p>
			<p>The doubled count is ${doubled}</p>
			<slot></slot>
		</div>
	`;
}

function Counter(props: { initValue?: number }) {
	// useCss(css``)
	u.css`
	:host {
		display: block;
	}
	button {
		background-color: #6200ea;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
	}
	`;
	return raw`
		<button
			@click=${() => {
				count(count() + 1 + (props?.initValue ?? 0));
			}}
		>
			Increment
		</button>
		<f-c .c=${CounterText}></f-c>
		${u.next}
	`;
}

function inlineCounter() {
	console.log(getPrevSibling());
	const inlineCount = getOrPushCtx("inlineCount", () => 0);
	onMounted(() => {
		console.log("inlineCounter mounted");
	});
	onUnmounted(() => {
		console.log("inlineCounter unmounted");
	});
	return raw`
		<button
			@click=${() => {
				inlineCount(inlineCount() + 1);
			}}
		>
			Inline Counter: ${inlineCount}
		</button>
		<button @click=${() => {
			inlineCount(0);
			clearCtx();
		}}>
			rest
		</button>
	`;
}

interface Todo {
	id: number;
	text: string;
	done: boolean;
}
const id = {
	v: 0,
};
const todoItem = state([
	{
		id: id.v++,
		text: "Learn Lit",
		done: false,
	},
] as Todo[]);

const addTodo = (value?: string) => {
	if (!value) return false;
	todoItem([...todoItem(), { id: id.v++, text: value, done: false }]);
	return true;
};
const deleteTodo = (id: number) => {
	todoItem(todoItem().flatMap((item) => (item.id === id ? [] : [item])));
};

const TodoItem = todoItem.repeat(
	(item) => item.id,
	(item) =>
		raw.html`
			<animation-loader
				.key=${item.id}
				.outer=${{
					className: "todo-item-remove",
					time: 500,
					inner: true,
				}}
				date-key-index=${item.id}
			>
				<li class="todo-item">
					<span>${item.text}</span>
					<button
						@click=${() => {
							deleteTodo(item.id);
						}}
					>
						Delete
					</button>
				</li>
			</animation-loader>
	`
);

function ForTodo() {
	const inputRef = createRef<HTMLInputElement>();
	u.css`
	.todo-item {
		animation: fade-in .5s ease-in-out;
	}
	.todo-item-remove {
		animation: fade-out .5s ease-in-out;
	}
	@keyframes fade-in {
		from {
			opacity: 0;
			background-color: #f00;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			background-color: #fff;
			transform: scale(1);
		}	
	}
	@keyframes fade-out {
		from {
			opacity: 1;
			background-color: #fff;
			transform: scale(1);
		}
		to {
			opacity: 0;
			background-color: #f00;
			transform: scale(0.8);
		}
	}
	`;

	return raw`
		<div> 
			<input type="text" placeholder="Add Todo" ${ref(inputRef)} />
			<button @click=${() => {
				if (!addTodo(inputRef.value?.value)) return;
				inputRef.value!.value = "";
			}}>Add</button>
			<button @click=${() => {
				for (let i = 0; i < 10; i++) {
					setTimeout(() => {
						requestAnimationFrame(() => {
							addTodo(`Todo ${i}`);
						});
					}, 15 * i);
				}
			}}>For Render 1000 Items</button>
			<button @click=${() => {
				for (let i = 0; i < 10; i++) {
					setTimeout(() => {
						requestAnimationFrame(() => {
							const items = todoItem();
							if (i < items.length) {
								todoItem(items.slice(0, items.length - i));
							}
						});
					}, 20 * i);
				}
			}}>Del Render 1000 Items</button>
			<ul>
				${TodoItem}
			</ul>
		</div>
	`;
}

function App() {
	const isLoad = state(true);
	function LoadTemp() {
		return isLoad() ? raw`<f-c .c=${inlineCounter}></f-c>` : nothing;
	}
	const num = state(0);
	return raw`
		${h({
			c: Counter,
			p: { initValue: 10 },
			n: () => raw`
				<p> ${num} </p>
				<p> this is next in Counter f-c </p>
			`,
		})}
		<f-c .c=${ForTodo}></f-c>
		<f-c .c=${inlineCounter}></f-c>
		<button @click=${() => isLoad(!isLoad())}>Toggle Component</button>
		<button @click=${() => {
			num(num() + 1);
		}}>num++</button>
		<lit-if 
			.handler=${LoadTemp}
		></lit-if>
	`;
}
$mount(App, document.body);
