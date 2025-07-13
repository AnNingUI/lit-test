import { html, render, type TemplateResult } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

type ToString = { toString(): string };
class FnProxyDOM<T, A extends string = never> {
	private value: T;
	private types = new Set<string>();
	private fnMap: Record<A, (v: T) => T> = {} as any;
	private listeners = new Set<() => void>();

	public readonly Msg!: { [P in A]: P };

	private constructor(value: T) {
		this.value = value;
	}

	public static module<T>(value: T) {
		return new FnProxyDOM<T, never>(value);
	}

	msg<const K extends readonly string[]>(types: K) {
		types.forEach((t) => this.types.add(t));
		const msgMap = Object.fromEntries(types.map((k) => [k, k])) as {
			[P in K[number]]: P;
		};
		const self = this as unknown as FnProxyDOM<T, K[number]>;
		Object.defineProperty(self, "Msg", {
			value: msgMap,
			writable: false,
			enumerable: true,
			configurable: false,
		});
		return self;
	}

	update(fnMap: Record<A, (v: T, payload?: any) => T>) {
		for (const k in fnMap) {
			if (this.types.has(k)) {
				this.fnMap[k as A] = fnMap[k as A];
			}
		}
		return this;
	}

	/**
	 * 每次调用 view() 都注册一个新的渲染器和容器。
	 */
	view(fn: (v: T) => TemplateResult) {
		// 创建一个 container 的 ref
		const spanRef: Ref<HTMLElement> = createRef();

		// 当 value 变化时，这个 closure 会被调用
		const update = () => {
			if (spanRef.value) {
				render(fn(this.value), spanRef.value);
			}
		};

		// 注册到 listeners
		this.listeners.add(update);

		// 首次调度渲染
		queueMicrotask(update);

		// 返回一个挂载点
		return html`<span ${ref(spanRef)}></span>`;
	}

	upload(
		type: A,
		payload?: any,
		effect?: { begin?: () => void; after?: () => void }
	) {
		const handler = this.fnMap[type] as (v: T, payload?: any) => T;
		if (!handler) return;
		effect?.begin?.();
		this.value = handler(this.value, payload);
		effect?.after?.();

		this.listeners.forEach((fn) => fn());
	}

	uploadAsync(
		type: A,
		payload?: any | Promise<any>,
		effect?: {
			begin?: () => void;
			after?: () => void;
			error?: (err: any) => void;
		}
	) {
		const handler = this.fnMap[type] as (v: T, payload?: any) => Promise<T>;
		if (!handler) return;

		effect?.begin?.();

		Promise.resolve(payload)
			.then((resolvedPayload) => handler(this.value, resolvedPayload))
			.then((newValue) => {
				this.value = newValue;
				effect?.after?.();
				this.listeners.forEach((fn) => fn());
			})
			.catch((err) => {
				effect?.error?.(err);
			});
	}

	get() {
		return this.value;
	}
}

export function state<T extends ToString>(value: T) {
	return FnProxyDOM.module(value);
}
