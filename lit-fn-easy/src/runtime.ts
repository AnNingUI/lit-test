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
import type { ItemTemplate, KeyFn } from "lit/directives/repeat.js";
import type { MatchLazy } from "./enuml";
import { repeat } from "./lit.mod";
export * from "./lit.mod";
export type Temp =
	| TemplateResult
	| TemplateResult<1>
	| TemplateResult<2>
	| TemplateResult<3>
	| string;

export const nowFnComponent = {
	prev: null as unknown as HTMLElement,
	value: null as unknown as FnComponent<unknown>,
};
export function getCurrentFnComponent() {
	return nowFnComponent.value;
}

export function getPrevSibling() {
	return nowFnComponent.prev;
}

export function getParentElement(el?: Element) {
	return el?.parentElement;
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

type InRepeatDirectiveFn<T> = T extends Iterable<infer K>
	? {
			(
				keyFnOrTemplate: KeyFn<K> | ItemTemplate<K>,
				template?: ItemTemplate<K>
			): () => unknown;
			(template: ItemTemplate<T>): () => unknown;
			(
				keyFn: KeyFn<T> | ItemTemplate<T>,
				template: ItemTemplate<T>
			): () => unknown;
	  }
	: never;

export type HasMap<T> = T extends Iterable<infer K>
	? {
			map<U>(
				callbackfn: (value: K, index: number, array: T) => U,
				thisArg?: any
			): U[];
	  }
	: {};

type State<T> = {
	(): T;
	(value: T): void;
} & HasMap<T> & {
		repeat: InRepeatDirectiveFn<T>;
	};

export function state<T>(initialValue: T): State<T> {
	const s = signal(initialValue);
	(s as any).$__LIT_FN_IF_STATE__ = true;
	if (Array.isArray(initialValue)) {
		const rep = (
			keyFnOrTemplate: KeyFn<T> | ItemTemplate<T>,
			template?: ItemTemplate<T>
		) => {
			const _rep = () => {
				return repeat(s() as [], keyFnOrTemplate, template);
			};
			(_rep as any).$__LIT_FN_REPEAT__$ = true;
			return _rep;
		};
		(s as any).repeat = rep;
		const map = <R>(h: (v: T, index: number, arr: T[]) => R) => {
			const _map = () =>
				(s() as HasMap<Array<any>>).map((v, idx, arr) => {
					const _ = h(v as T, idx, arr as T[]);
					if (isRaw(_)) return _();
					if (isLitHtml(_)) return _;
					return _;
				});
			_map.$__LIT_FN_MAP__$ = true;
			return _map;
		};
		(s as any).map = map;
	}
	return s as State<T>;
}

export function isMapFn(value: any) {
	return typeof value === "function" && value?.$__LIT_FN_MAP__$ === true;
}

export function isRepFn(value: any) {
	return typeof value === "function" && value?.$__LIT_FN_REPEAT__$ === true;
}

export function isRaw(value: any): value is () => Temp {
	return (
		typeof value === "function" &&
		typeof (value as any).$__lit_fn_run__ === "function"
	);
}

export function isLitHtml(value: any): value is TemplateResult {
	return typeof value === "object" && (value as any)._$litType$;
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
					if (isMapFn(v)) {
						return v();
					}
					if (isRepFn(v)) {
						return v();
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

interface Raw {
	(
		strings: TemplateStringsArray,
		...values: unknown[]
	): () => TemplateResult<1>;
	html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult<1>;
}

export const raw: Raw = (() => {
	const r: Raw = _rStr<TemplateResult<1>>(litHtml) as unknown as Raw;
	r.html = litHtml;
	return r;
})();

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

	connectedCallback(): void {
		super.connectedCallback();
		nowFnComponent.prev = this.previousElementSibling as HTMLElement;
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

/**
 * Must Only one firstChildInSlot
 * @element animation-loader
 */
export class AnimationLoader extends LitElement {
	@property({ type: Object, attribute: "outer" })
	outer = { className: "", time: 0 };

	static #nowId = 0;

	html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult<1> {
		return litHtml(strings, ...values);
	}

	protected createRenderRoot(): HTMLElement | DocumentFragment {
		return this;
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		AnimationLoader.#nowId--;
	}

	render() {
		const child = this.firstElementChild;
		const self = this;
		const outer = this.outer;
		const remove = () => {
			this.parentElement?.removeChild(self);
		};

		if (child) {
			this.remove = function () {
				if (outer.className) {
					child.classList.add(outer.className);
					setTimeout(() => {
						child.classList.remove(outer.className);
						remove();
					}, outer.time);
				} else {
					remove();
				}
			};
		}

		return child;
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
