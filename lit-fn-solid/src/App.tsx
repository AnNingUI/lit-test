import { html } from "lit";
import { defineComponent, useState } from "lit-fn";
import { createEffect, createSignal, onMount, type JSX } from "solid-js";
import "./App.css";
import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
// 支持的属性类型定义方式
type PropType = {
	type:
		| StringConstructor
		| NumberConstructor
		| BooleanConstructor
		| ObjectConstructor
		| ArrayConstructor;
	default?: any;
	reflect?: boolean;
};

// 解析属性配置的类型
type ResolveProps<T> = T extends Record<string, PropType>
	? {
			[K in keyof T]: T[K]["type"] extends StringConstructor
				? string
				: T[K]["type"] extends NumberConstructor
				? number
				: T[K]["type"] extends BooleanConstructor
				? boolean
				: T[K]["type"] extends ObjectConstructor
				? object
				: T[K]["type"] extends ArrayConstructor
				? any[]
				: any;
	  }
	: T;

// 改进的 LitComponentToSolid 实现
function LitComponentToSolid<
	TagName extends string,
	PropsConfig extends Record<string, PropType> | Record<string, any>
>(
	tagName: TagName,
	options: { props: PropsConfig }
): (
	props: JSX.HTMLAttributes<HTMLElement> & ResolveProps<PropsConfig>
) => JSX.Element {
	return (props) => {
		const [hostElement, setHostElement] = createSignal<HTMLElement | null>(
			null
		);
		const [litElement, setLitElement] = createSignal<HTMLElement | null>(null);

		// 合并默认值和传入的 props
		const mergedProps = () => {
			const result: Record<string, any> = {};
			const propDefinitions = options.props as Record<string, PropType>;

			// 应用默认值
			for (const [key, value] of Object.entries(propDefinitions)) {
				if (typeof value === "object" && "default" in value) {
					result[key] = value.default;
				}
			}

			// 应用传入的 props 覆盖默认值
			for (const [key, value] of Object.entries(props)) {
				if (key === "children" || key === "ref") continue;
				result[key] = value;
			}

			return result;
		};

		onMount(() => {
			if (!hostElement()) return;

			// 创建 Lit 组件实例
			const el = document.createElement(tagName);
			setLitElement(el);

			// 应用合并后的 props
			const propsToApply = mergedProps();
			for (const [key, value] of Object.entries(propsToApply)) {
				(el as any)[key] = value;
			}

			// 插入到正确位置
			hostElement()?.appendChild(el);

			// 清理函数
			return () => {
				el.remove();
			};
		});

		// 监听 props 变化并更新 Lit 组件
		createEffect(() => {
			if (!litElement()) return;

			const propsToApply = mergedProps();
			for (const [key, value] of Object.entries(propsToApply)) {
				(litElement() as any)[key] = value;
			}
		});

		//
		return <div ref={setHostElement}>{props.children}</div>;
	};
}

// 改进 defineProps 函数
function defineProps<T extends Record<string, any>>(defaults?: T) {
	return {
		props: defaults || {},
	} as { props: T };
}

// 确保 defineComponent 返回正确的标签名
defineComponent(
	"app-test",
	(props: { msg: string }) => {
		return html`
			<div>
				${props.msg ?? "Hello, world!"}
				<slot></slot>
			</div>
		`;
	},
	{ props: ["msg"] }
);
defineComponent(
	"app-counter",
	(props: { initialCount: number }) => {
		const [count, setCount] = useState(props.initialCount ?? 0);
		return html`
			<div>${count}</div>
			<button
				@click=${() =>
					setCount((count) => {
						const nextCount = count + 1;
						return nextCount;
					})}
			>
				Increment
			</button>
		`;
	},
	{ props: ["initialCount"] }
);

const AppTest = LitComponentToSolid(
	"app-test",
	defineProps<{
		msg?: string;
	}>()
);

const AppCounter = LitComponentToSolid(
	"app-counter",
	defineProps<{
		initialCount?: number;
	}>()
);

function App() {
	const [count, setCount] = createSignal(0);
	return (
		<>
			{/*  */}
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} class="logo" alt="Vite logo" />
				</a>
				<a href="https://solidjs.com" target="_blank">
					<img src={solidLogo} class="logo solid" alt="Solid logo" />
				</a>
			</div>
			<AppTest msg="Hello, world!" />
			<AppCounter initialCount={10} class="logo solid" />
			<h1>Vite + Solid</h1>
			<div class="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count()}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p class="read-the-docs">
				Click on the Vite and Solid logos to learn more
			</p>
		</>
	);
}

export default App;
