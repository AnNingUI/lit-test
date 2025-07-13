// effects.ts

import { type Effect, type Msg } from "./types";

/**
 * 创建一个副作用 Cmd。
 * @template TMsg - 消息类型
 * @param {Effect<TMsg>} effectFn - 副作用函数。
 * @returns {Effect<TMsg>}
 */
export function Cmd<TMsg extends Msg>(effectFn: Effect<TMsg>): Effect<TMsg> {
	return effectFn;
}

/**
 * 批量执行多个副作用。
 * @template TMsg - 消息类型
 * @param {Array<Effect<TMsg>>} effects - 副作用数组。
 * @returns {Array<Effect<TMsg>>}
 */
export function batch<TMsg extends Msg>(
	effects: Array<Effect<TMsg>>
): Array<Effect<TMsg>> {
	return effects;
}

/**
 * 创建一个 HTTP 请求副作用，兼容任意请求方法（如 fetch、axios 等）。
 *
 * @template TData - 请求返回的数据类型
 * @template TRightMsg - 成功时的消息类型
 * @template TLeftMsg - 失败时的消息类型
 *
 * @param {() => Promise<TData>} requestFn - 返回 Promise 的任意请求函数
 * @param {(data: TData) => TRightMsg} successMsg - 成功时生成消息的函数
 * @param {(error: Error) => TLeftMsg} errorMsg - 失败时生成消息的函数
 *
 * @returns {Effect<TRightMsg | TLeftMsg>} - 可分发消息的副作用函数
 */
export function httpRequest<TData, TRightMsg extends Msg, TLeftMsg extends Msg>(
	requestFn: () => Promise<TData>,
	successMsg: (data: TData) => TRightMsg,
	errorMsg: (error: Error) => TLeftMsg
): Effect<TRightMsg | TLeftMsg> {
	return async (dispatch) => {
		try {
			const data = await requestFn();
			dispatch(successMsg(data));
		} catch (error: any) {
			dispatch(
				errorMsg(error instanceof Error ? error : new Error(String(error)))
			);
		}
	};
}
