import type { ItemTemplate, KeyFn } from "lit/directives/repeat.js";
import { isLitHtml, isRaw, repeat } from "./runtime";

export interface RepeatDirectiveLazyFn {
	<T>(
		items: Iterable<T>,
		keyFnOrTemplate: KeyFn<T> | ItemTemplate<T>,
		template?: ItemTemplate<T>
	): unknown;
	<T>(items: Iterable<T>, template: ItemTemplate<T>): unknown;
	<T>(
		items: Iterable<T>,
		keyFn: KeyFn<T> | ItemTemplate<T>,
		template: ItemTemplate<T>
	): unknown;
}

export const repeatLazy: RepeatDirectiveLazyFn = <T>(
	items: Iterable<T>,
	keyFnOrTemplate: KeyFn<T> | ItemTemplate<T>,
	template?: ItemTemplate<T>
) => {
	const _rep = () => {
		const loadTemp: ItemTemplate<T> = (a: T, index: number) => {
			let load;
			if (template) {
				load = template(a, index);
			} else {
				load = keyFnOrTemplate(a, index);
			}
			if (isRaw(load)) {
				return load();
			} else return load;
		};
		if (template) {
			return repeat(items, keyFnOrTemplate, loadTemp);
		} else {
			return repeat(items, loadTemp);
		}
	};
	(_rep as any).$__LIT_FN_REPEAT__$ = true;
	return _rep;
};

export const mapLazy = <T, R>(
	items: Array<T> | undefined,
	f: (value: T, index: number, array: T[]) => R
): (() => R[]) => {
	const _map = () => {
		if (items) {
			return items.map((v, idx, arr) => {
				const _ = f(v as T, idx, arr as T[]);
				if (isRaw(_)) return _();
				if (isLitHtml(_)) return _;
				return _;
			});
		} else {
			return [];
		}
	};
	(_map as any).$__LIT_FN_MAP__$ = true;
	return _map as () => R[];
};
