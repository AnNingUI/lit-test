// runtime.ts

import { effect, effectScope, signal } from "alien-signals";
import { render } from "./html";
import {
	type Effect,
	type Model,
	type Msg,
	type Program,
	type Subscription,
} from "./types";

/**
 * 运行 Elm 风格的应用程序。
 * @template TModel - 应用的模型类型。
 * @template TMsg - 应用的消息类型。
 * @param {Program<TModel, TMsg>} program - 定义应用行为的 Program 对象。
 * @param {HTMLElement} rootElement - 应用程序挂载的 DOM 元素。
 */
export function run<TModel extends Model, TMsg extends Msg>(
	program: Program<TModel, TMsg>,
	rootElement: HTMLElement
): void {
	let currentSubscriptions: Array<() => void> = [];

	// 初始化模型和副作用
	const [initialModel, initialEffects] = program.init();
	const modelSignal = signal(initialModel);

	/**
	 * 消息分发函数。
	 * @param {TMsg} msg - 要分发的消息。
	 */
	const dispatch = (msg: TMsg): void => {
		// 在这里可以考虑集成 Immer.js 来更安全、高效地处理不可变状态更新
		// 例如：const [newModel, effects] = program.update(msg, produce(modelSignal.value, draft => /* update draft */));
		const [newModel, effects] = program.update(msg, modelSignal());
		newModel;
		modelSignal(newModel); // 更新 Signal 的值，这将自动触发订阅者 (renderView 和 manageSubscriptions)

		executeEffects(effects);
	};

	/**
	 * 执行副作用数组。
	 * @param {Array<Effect<TMsg>>} effects - 要执行的副作用数组。
	 */
	const executeEffects = (effects: Array<Effect<TMsg>>): void => {
		if (!effects || effects.length === 0) {
			return;
		}
		effects.forEach((effect) => {
			// 副作用函数接收 dispatch，以便后续操作可以发送消息
			effect(dispatch);
		});
	};

	/**
	 * 渲染视图到 DOM。
	 */
	const renderView = (): void => {
		const viewResult = program.view(modelSignal(), dispatch);
		if (!viewResult) return;
		render(viewResult, rootElement);
	};

	/**
	 * 管理订阅：清理旧订阅并应用新订阅。
	 */
	const manageSubscriptions = (): void => {
		// 清理所有旧订阅
		currentSubscriptions.forEach((unsubscribe) => unsubscribe());
		currentSubscriptions = []; // 重置订阅列表

		if (program.subscriptions) {
			const subscriptionsToApply: Array<Subscription<TMsg>> =
				program.subscriptions(modelSignal());
			subscriptionsToApply.forEach((subscription) => {
				const unsubscribe = subscription(dispatch);
				if (typeof unsubscribe === "function") {
					currentSubscriptions.push(unsubscribe);
				}
			});
		}
	};

	// 订阅模型变化：每次模型更新时，重新渲染视图并管理订阅。
	// 这确保了 UI 和外部事件订阅与应用状态始终同步。
	effectScope(() => {
		effect(renderView);
		effect(manageSubscriptions);
	});

	// 应用首次启动：进行初始渲染、执行初始副作用和设置初始订阅。
	renderView();
	executeEffects(initialEffects);
	manageSubscriptions();
}
