// app.ts

import { ref } from "lit-html/directives/ref.js";
import { Counter } from "./counter";
import { httpRequest } from "./effects";
import { html } from "./html";
import { run } from "./runtime";
import { type Effect, type Model, type Msg, type Subscription } from "./types";

ref;
// --- 1. Model (状态) ---
/**
 * @interface AppModel
 * @extends Model
 * 定义应用程序的具体状态模型。
 */
interface AppModel extends Model {
	count: number;
	fetchedData: string | null;
	isLoading: boolean;
	error: string | null;
	childCount: number;
}

const initialModel: AppModel = {
	count: 0,
	fetchedData: null,
	isLoading: false,
	error: null,
	childCount: 0,
};

// --- 2. Msg (消息) ---
/**
 * @type AppMsg
 * 定义应用程序的所有可能消息类型。使用联合类型确保类型安全。
 */
type AppMsg =
	| { type: "Increment" }
	| { type: "Decrement" }
	| { type: "SetCount"; payload: number }
	| { type: "FetchData" }
	| { type: "FetchDataSuccess"; payload: string }
	| { type: "FetchDataError"; payload: string }
	| { type: "Tick" }
	| { type: "UpdateCounter"; payload: number };

// match(msg.type, {
// 	"Increment": () => {}
// })
/**
 * 类型安全的消息匹配器，用于替代 switch-case 消息分发。
 *
 * @template TModel - 应用模型类型
 * @template TMsg - 消息类型
 * @param type - 当前消息的类型
 * @param handlers - 各种消息类型的处理器映射
 * @returns 处理后的 [model, effects] 结果
 */
export function match<TModel, TMsg extends Msg>(
	type: TMsg["type"],
	handlers: {
		[K in TMsg["type"]]: (msg: Extract<TMsg, { type: K }>) => [TModel, any[]];
	} & {
		default?: (msg: TMsg) => [TModel, any[]];
	}
): (msg: TMsg) => [TModel, any[]] {
	const handler = handlers[type as keyof typeof handlers];
	if (handler) {
		return (msg: TMsg) => handler(msg as Extract<TMsg, { type: typeof type }>); // 强制类型转换以满足TS
	} else if (handlers.default) {
		return handlers.default;
	}
	throw new Error(`No handler for message type: ${type}`);
}
// --- 3. Update (更新逻辑) ---
/**
 * @param {AppMsg} msg - 接收到的消息。
 * @param {AppModel} model - 当前的应用模型。
 * @returns {[AppModel, Array<Effect<AppMsg>>]} 更新后的模型和副作用数组。
 */
function update(
	msg: AppMsg,
	model: AppModel
): [AppModel, Array<Effect<AppMsg>>] {
	return match<AppModel, AppMsg>(msg.type, {
		Increment: () => [{ ...model, count: model.count + 1 }, []],
		Decrement: () => [{ ...model, count: model.count - 1 }, []],
		SetCount: (msg) => [{ ...model, count: msg.payload }, []],
		FetchData: () => {
			const fetchEffect: Effect<AppMsg> = httpRequest(
				() =>
					fetch("https://jsonplaceholder.typicode.com/posts/1").then((res) =>
						res.json()
					),
				(data) => ({
					type: "FetchDataSuccess",
					payload: JSON.stringify(data, null, 2),
				}),
				(error) => ({ type: "FetchDataError", payload: error.message })
			);
			return [{ ...model, isLoading: true, error: null }, [fetchEffect]];
		},
		FetchDataSuccess: (msg) => [
			{ ...model, isLoading: false, fetchedData: msg.payload },
			[],
		],
		FetchDataError: (msg) => [
			{ ...model, isLoading: false, error: msg.payload },
			[],
		],
		Tick: () => [{ ...model, count: model.count + 1 }, []],
		UpdateCounter: (msg) => [{ ...model, childCount: msg.payload }, []],
		default: () => [model, []],
	})(msg);
}

// --- 4. View (视图) ---
/**
 * @param {AppModel} model - 当前的应用模型。
 * @param {(msg: AppMsg) => void} dispatch - 消息分发函数。
 * @returns {import('lit').TemplateResult} lit-html 模板。
 */
function view(
	model: AppModel,
	dispatch: (msg: AppMsg) => void
): import("lit-html").TemplateResult {
	return html`
		<div>
			<h1>计数器: ${model.count}</h1>
			<button @click=${() => dispatch({ type: "Increment" })}>增加</button>
			<button @click=${() => dispatch({ type: "Decrement" })}>减少</button>
			<button @click=${() => dispatch({ type: "SetCount", payload: 0 })}>
				重置
			</button>

			<hr />

			<h2>数据获取示例</h2>
			<button
				@click=${() => dispatch({ type: "FetchData" })}
				?disabled=${model.isLoading}
			>
				${model.isLoading ? "加载中..." : "异步获取数据"}
			</button>
			${model.error
				? html`<p style="color: red;">错误: ${model.error}</p>`
				: ""}
			${model.fetchedData ? html`<pre>${model.fetchedData}</pre>` : ""}

			<hr />
			<h2>订阅示例 (每秒自增)</h2>
			<p>这个计数器每秒自动增加 (除非你点击其他按钮)。</p>
		</div>
		${Counter({
			count: model.childCount,
			onCountChange: (newCount) =>
				dispatch({ type: "UpdateCounter", payload: newCount }),
		})}
	`;
}
// --- 5. Subscriptions (订阅) ---
/**
 * @param {AppModel} _ - 当前的应用模型。
 * @returns {Array<Subscription<AppMsg>>} 订阅数组。
 */
function subscriptions(_: AppModel): Array<Subscription<AppMsg>> {
	// 示例：一个定时器订阅，每秒发送一个 'Tick' 消息
	const timerSubscription: Subscription<AppMsg> = (dispatch) => {
		const intervalId = setInterval(() => {
			dispatch({ type: "Tick" });
		}, 1000);
		return () => clearInterval(intervalId); // 返回清理函数，在订阅被移除时调用
	};

	return [timerSubscription];
}

// --- 运行应用程序 ---
document.addEventListener("DOMContentLoaded", () => {
	const appRoot = document.getElementById("app-root");
	if (appRoot) {
		run<AppModel, AppMsg>( // 明确指定 Model 和 Msg 类型
			{
				init: () => [initialModel, []],
				update: update,
				view: view,
				subscriptions: subscriptions,
			},
			appRoot
		);
	} else {
		console.error("Root element #app-root not found!");
	}
});
