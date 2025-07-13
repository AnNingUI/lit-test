// CounterApp.ts

import { html, type TemplateResult } from "lit-html";
import type { Effect, Model } from "./types";

interface ChildModel extends Model {
	count: number;
}

// 子组件的消息类型
export type ChildMsg = { type: "Increment" } | { type: "Decrement" };

// 子组件的初始状态
export const childInitialModel: ChildModel = {
	count: 0,
};

// 子组件的更新逻辑
export function childUpdate(
	msg: ChildMsg,
	model: ChildModel
): [ChildModel, Array<Effect<ChildMsg>>] {
	switch (msg.type) {
		case "Increment":
			return [{ ...model, count: model.count + 1 }, []];
		case "Decrement":
			return [{ ...model, count: model.count - 1 }, []];
		default:
			return [model, []];
	}
}

// 子组件的视图
export function childView(
	model: ChildModel,
	dispatch: (msg: ChildMsg) => void
): import("lit-html").TemplateResult {
	return html`
		<div>
			<h2>子组件计数器: ${model.count}</h2>
			<button @click=${() => dispatch({ type: "Increment" })}>增加</button>
			<button @click=${() => dispatch({ type: "Decrement" })}>减少</button>
		</div>
	`;
}
export const Counter = (props: {
	count: number;
	onCountChange: (count: number) => void;
}): TemplateResult => {
	const internalModel: ChildModel = { count: props.count };

	const dispatch = (msg: ChildMsg) => {
		const [newModel] = childUpdate(msg, internalModel);
		props.onCountChange(newModel.count);
	};

	return childView(internalModel, dispatch);
};
