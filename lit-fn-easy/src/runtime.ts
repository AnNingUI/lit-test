import { computed as alienComputed, effect, signal } from "alien-signals";
import memoize from "fast-memoize";
import {
	css,
	CSSResult,
	LitElement,
	html as litHtml,
	render as litRender,
	mathml,
	svg,
	type CSSResultGroup,
	type TemplateResult,
} from "lit";
import { state as litState, property } from "lit/decorators.js";
import type { MatchLazy } from "./enuml";
export * from "./lit.mod";
export type Temp =
	| TemplateResult
	| TemplateResult<1>
	| TemplateResult<2>
	| TemplateResult<3>
	| string;

const nowFnComponent = {
	value: null as unknown as FnComponent<unknown>,
};
export function getCurrentFnComponent() {
	return nowFnComponent.value;
}

function reactiveRender(fn: () => () => Temp, container: Element) {
	const result = fn();
	effect(() => {
		const rFn = (result as any)?.$__lit_fn_run__ ?? result;
		litRender(rFn(), container as HTMLElement);
	});
}
export function onMounted(fn: () => void) {
	fn();
}

export function onUnmounted(fn: () => void) {
	nowFnComponent.value.addOnUnmount(fn);
}

interface State<T> {
	(): T;
	(value: T): void;
}

export function state<T>(initialValue: T) {
	const s = signal(initialValue);
	(s as any).$__LIT_FN_IF_STATE__ = true;
	return s;
}

export function pushCtx<R>(statePush: (ctx: Record<string, any>) => R | void) {
	const now = getCurrentFnComponent();
	const ctx = FnComponent.stateCtx[now.nowNum] || {};
	return statePush(ctx);
}

export function getCtx<T>(key: string): T | undefined {
	const now = getCurrentFnComponent();
	const ctx = FnComponent.stateCtx[now.nowNum] || {};
	return ctx[key];
}

export function getOrPushCtx<T>(key: string, initialValue: () => T): State<T> {
	const value = state((getCtx(key) as T) || initialValue());
	const nowNum = getCurrentFnComponent().nowNum;
	let ctx = FnComponent.stateCtx[nowNum];
	if (!ctx) {
		ctx = {};
		ctx[key] = initialValue();
		FnComponent.stateCtx[nowNum] = ctx;
	}
	effect(() => {
		ctx[key] = value();
		FnComponent.stateCtx[nowNum] = ctx;
	});
	return value;
}

export function clearCtx() {
	const now = getCurrentFnComponent();
	FnComponent.stateCtx[now.nowNum] = {};
}

export function computed<T>(fn: () => T) {
	const c = alienComputed(fn);
	(c as any).$__LIT_FN_IF_COMPUTED__ = true;
	return c;
}

export function useNext() {
	const now = getCurrentFnComponent();
	return {
		type: "$__LIT_FN_IF_NEXT__",
		value: now.nextNode,
	} as {};
}

function isNext(v: any): v is {
	value?: NextNode;
} {
	return typeof v === "object" && v.type === "$__LIT_FN_IF_NEXT__";
}

const _rStr = memoize(
	<FN extends Temp>(
			strRender: (strings: TemplateStringsArray, ...values: unknown[]) => FN
		) =>
		(
			strings: TemplateStringsArray,
			...values: any[]
		): {
			(): FN;
		} => {
			const createStateValues = (vs: any[]): Array<State<any>> => {
				return vs.map((v) => {
					if (isComponent(v)) {
						return litHtml`
						<fn-component .component=${v.component} .props=${v.props} .nextNode=${v.next}></fn-component>
						</fn-component>
					`;
					}
					if (isNext(v)) {
						const r = v?.value?.() ?? "";
						if (typeof r === "function") {
							return r();
						} else {
							return r;
						}
					}
					if (isState(v) || isComputed(v)) {
						return v();
					} else {
						return v;
					}
				});
			};

			const stateVs = createStateValues(values);

			const templateFn = () => strRender(strings, ...stateVs);
			templateFn.$__lit_fn_run__ = () => {
				const __stateVs = createStateValues(values);
				return strRender(strings, ...__stateVs);
			};
			return templateFn;
		}
);

export const raw: (
	strings: TemplateStringsArray,
	...values: unknown[]
) => () => TemplateResult<1> = _rStr<TemplateResult<1>>(litHtml);

export const r: {
	html(
		strings: TemplateStringsArray,
		...values: unknown[]
	): () => TemplateResult<1>;
	svg(
		strings: TemplateStringsArray,
		...values: unknown[]
	): () => TemplateResult<2>;
	mathml(
		strings: TemplateStringsArray,
		...values: unknown[]
	): () => TemplateResult<3>;
} = {
	html: raw,
	svg: _rStr<TemplateResult<2>>(svg),
	mathml: _rStr<TemplateResult<3>>(mathml),
};

// 类型守卫
function isState(value: any): value is State<any> & {
	$__LIT_FN_IF_STATE__: true;
} {
	return typeof value === "function" && (value as any).$__LIT_FN_IF_STATE__;
}

function isComputed(value: any): value is () => any & {
	$__LIT_FN_IF_COMPUTED__: true;
} {
	return typeof value === "function" && (value as any).$__LIT_FN_IF_COMPUTED__;
}

export function useCss(css: CSSResult) {
	// 在当前示例中注入演示
	const now = getCurrentFnComponent();
	now.shadowRoot!.adoptedStyleSheets.push(css.styleSheet!);
}

export const u = {
	css: (
		strings: TemplateStringsArray,
		...values: (CSSResultGroup | number)[]
	) => useCss(css(strings, ...values)),

	get next() {
		return useNext();
	},

	get self() {
		return getCurrentFnComponent();
	},
};

type ComponentFN<Props, T extends Temp> =
	| (() => () => T)
	| ((props: Props) => () => T)
	| ((props: any) => () => T)
	| ((props?: Props) => () => T);
export class FnComponent<T> extends LitElement {
	static stateCtx = new Array<Record<string, any>>();
	static num = 0;
	#nowNum = 0;

	get nowNum() {
		return this.#nowNum;
	}

	@property({
		type: Object,
		attribute: "nextNode",
	})
	nextNode!: (() => Temp) | undefined;

	#unmountFns: Array<() => void> = [];
	constructor() {
		super();
		FnComponent.num++;
		this.#nowNum = FnComponent.num;
	}
	@property({
		type: Object,
		attribute: "component",
	})
	component!: ComponentFN<T, Temp>;
	@property({
		type: Object,
		attribute: "props",
	})
	props!: T;
	addOnUnmount(fn: () => void) {
		this.#unmountFns.push(fn);
	}
	disconnectedCallback(): void {
		super.disconnectedCallback();
		FnComponent.num--;
		this.#unmountFns.forEach((fn) => fn());
	}

	render() {
		nowFnComponent.value = this;
		const div = document.createDocumentFragment();
		reactiveRender(
			() => this.component(this.props),
			div as unknown as HTMLElement
		);
		return div;
	}
}
customElements.define("fn-component", FnComponent);
class FcComponent<T> extends FnComponent<T> {
	set p(props: T) {
		this.props = props;
	}

	set c(component: ComponentFN<T, Temp>) {
		this.component = component;
	}
}
customElements.define("f-c", FcComponent);

type IfHander =
	| (() => Temp)
	| MatchLazy<any, any, any, Temp>
	| (() => () => Temp)
	| MatchLazy<any, any, any, () => Temp>;
export class LitIf extends LitElement {
	@property({
		type: Object,
		attribute: "handler",
	})
	handler!: IfHander;

	@litState()
	temp!: Temp;

	@property({
		type: Boolean,
		attribute: "in",
	})
	in = true;

	#run() {
		const result = this.handler();
		if (typeof result === "function") {
			return result();
		} else {
			return result;
		}
	}

	protected createRenderRoot() {
		return !this.in ? (this.parentNode! as HTMLElement) : this;
	}

	#hasRunEffect = false;

	render() {
		this.temp = this.#run();
		if (this.#hasRunEffect === false) {
			effect(() => {
				this.temp = this.#run();
			});
			this.#hasRunEffect = true;
		}
		return this.temp;
	}
}
customElements.define("lit-if", LitIf);

type GetterArray<T> = () => T[];
export class LitFor<T> extends LitElement {
	@property({
		type: Array,
		attribute: "items",
	})
	items!: T[] | GetterArray<T> | State<T[]>;

	@property({
		type: Object,
		attribute: "handler",
	})
	handler!: (
		item: T,
		index: number,
		selfs: {
			items: T[];
			el: (get: (root: HTMLElement) => HTMLElement) => HTMLElement;
		}
	) => Temp | (() => Temp);

	@property({
		type: Boolean,
		attribute: "in",
	})
	in = true;

	@property({
		type: Boolean,
		attribute: "isStatic",
	})
	isStatic = false;

	#cache: Temp[] = [];

	#run() {
		const items =
			(typeof this.items === "function" ? this.items() : this.items) || [];
		const get = () =>
			items.map((it, idx) => {
				const result = this.handler(it, idx, {
					items,
					el: (get) => {
						const root = this.renderRoot as HTMLElement;
						return get(root);
					},
				});
				if (typeof result === "function") {
					return result();
				} else {
					return result;
				}
			});

		if (this.isStatic) {
			if (this.#cache.length > 0) {
				return this.#cache;
			} else {
				this.#cache = get();
				return this.#cache;
			}
		}

		return get();
	}

	protected createRenderRoot() {
		return !this.in ? (this.parentNode! as HTMLElement) : this;
	}

	#hasRunEffect = false;

	render() {
		const temp = this.#run();
		if (this.#hasRunEffect === false) {
			effect(this.#run);
			this.#hasRunEffect = true;
		}
		return temp;
	}
}
customElements.define("lit-for", LitFor);

/**
 * Must Only one firstChildInSlot
 * @element animation-loader
 */
export class AnimationLoader extends LitElement {
	@property({ type: Object, attribute: "enter" })
	enter = { className: "", inner: false };

	@property({ type: Object, attribute: "outer" })
	outer = { className: "", time: 2000, inner: false };

	#OuterTimer!: number;

	html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult<1> {
		return litHtml(strings, ...values);
	}

	get #firstChildInSlot() {
		const slot = this.firstElementChild as HTMLSlotElement;
		return slot;
	}

	get #enterEl() {
		const enter = this.enter ?? {};
		if (enter.inner) {
			return this.#firstChildInSlot as HTMLElement;
		}
		return this as HTMLElement;
	}

	get #outerEl() {
		const outer = this.outer ?? {};
		if (outer.inner) {
			const el = this.#firstChildInSlot as HTMLElement;
			return el;
		}
		return this as HTMLElement;
	}

	remove() {
		const self = this;
		const newRemove = () => {
			const parent = self.parentNode;
			if (parent) {
				parent.removeChild(self);
			}
		};
		if (self.outer.className) {
			const outer = self.outer;
			const enter = self.enter ?? {};
			// const

			enter?.className && self.#enterEl.classList.remove(self.enter.className);
			self.#outerEl.classList.add(outer.className);
			if (outer.time) {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						self.#OuterTimer = setTimeout(() => {
							self.#outerEl.classList.remove(outer.className);
							newRemove();
							clearTimeout(self.#OuterTimer);
						}, outer.time + 0.01);
					});
				});
			} else {
				newRemove();
			}
		} else {
			newRemove();
		}
	}

	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

	connectedCallback(): void {
		super.connectedCallback();
		if (this.enter.className) {
			this.classList.add(this.enter.className);
		}
	}

	render() {
		return this.html`
			<slot></slot>
		`;
	}
}

customElements.define("animation-loader", AnimationLoader);

export class AppLoader extends LitElement {
	@property({
		type: Object,
		attribute: "component",
	})
	component!: () => () => Temp;

	protected createRenderRoot() {
		return this;
	}

	render() {
		return this.component()();
	}
}
customElements.define("app-loader", AppLoader);
// new FnComponent().component;
export function $mount(fn: () => () => Temp, container: Element) {
	litRender(
		litHtml` <app-loader .component=${fn}></app-loader> `,
		container as HTMLElement
	);
}
type NextNode = (() => Temp) | (() => () => Temp);
interface H<T> {
	c: ComponentFN<T, Temp>;
	p?: T;
	n?: NextNode;
}
export function h<T>({ p, c, n }: H<T>) {
	return {
		"$LIT-FN-NODETYPE$": "Component",
		props: p,
		component: c,
		next: n,
	};
}

function isComponent(node: any): node is {
	"$LIT-FN-NODETYPE$": "Component";
	props: any;
	component: ComponentFN<any, Temp>;
	next?: NextNode;
} {
	return (
		typeof node === "object" &&
		node !== null &&
		"$LIT-FN-NODETYPE$" in node &&
		node["$LIT-FN-NODETYPE$"] === "Component" &&
		typeof node.component === "function" &&
		(typeof node.props === "object" || typeof node.props === "undefined")
	);
}
