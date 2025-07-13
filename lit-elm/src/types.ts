// types.ts

import { type TemplateResult } from "lit-html";

/**
 * 通用模型类型。所有应用状态都应符合此接口或其扩展。
 */
export type Model = Record<string, any>;

/**
 * 通用消息类型。所有消息都应至少有一个 `type` 属性。
 */
export interface Msg {
	type: string;
	[key: string]: any; // 允许消息包含额外的属性 (payload)
}

/**
 * 副作用类型。一个接受 `dispatch` 函数并返回 `void` 或 `Promise<void>` 的函数。
 * @template TMsg - 消息类型
 */
export type Effect<TMsg extends Msg> = (
	dispatch: (msg: TMsg) => void
) => Promise<void> | void;

/**
 * 订阅类型。一个接受 `dispatch` 函数并返回一个清理函数（用于取消订阅）的函数。
 * @template TMsg - 消息类型
 */
export type Subscription<TMsg extends Msg> = (
	dispatch: (msg: TMsg) => void
) => () => void;

/**
 * 应用程序的 Program 接口，定义了 Elm 核心函数的结构。
 * @template TModel - 应用的模型类型
 * @template TMsg - 应用的消息类型
 */
export interface Program<TModel extends Model, TMsg extends Msg> {
	/**
	 * 应用的初始化函数，返回初始模型和副作用。
	 * @returns {[TModel, Array<Effect<TMsg>>]} 初始模型和副作用数组。
	 */
	init: () => [TModel, Array<Effect<TMsg>>];

	/**
	 * 更新函数，根据消息和当前模型返回新模型和副作用。
	 * 每次更新都应返回一个新的模型对象 (不可变性)。
	 * @param msg - 传入的消息。
	 * @param model - 当前的应用模型。
	 * @returns {[TModel, Array<Effect<TMsg>>]} 更新后的模型和副作用数组。
	 */
	update: (msg: TMsg, model: TModel) => [TModel, Array<Effect<TMsg>>];

	/**
	 * 视图函数，根据当前模型和 dispatch 函数返回 lit-html 模板。
	 * @param model - 当前的应用模型。
	 * @param dispatch - 消息分发函数。
	 * @returns {TemplateResult} lit-html 模板结果。
	 */
	view: (model: TModel, dispatch: (msg: TMsg) => void) => TemplateResult;

	/**
	 * 可选的订阅函数，用于处理外部事件（如定时器、WebSocket）。
	 * 返回一个订阅数组，每个订阅都会接收 dispatch 函数并返回一个清理函数。
	 * @param model - 当前的应用模型。
	 * @returns {Array<Subscription<TMsg>>} 订阅数组。
	 */
	subscriptions?: (model: TModel) => Array<Subscription<TMsg>>;
}
