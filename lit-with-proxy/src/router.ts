// src/router.ts
import { render, type TemplateResult } from "lit";

export type Params = Record<string, string>;

export interface RouteDef {
	path: string;
	render: (params: Params) => TemplateResult;
}

export interface RouterOptions {
	routes: RouteDef[];
	default?: (hash: string) => TemplateResult;
}

function compileRoute(path: string): { regex: RegExp; paramNames: string[] } {
	const paramNames: string[] = [];

	// 1. 转义所有正则元字符（不含 : 和 *）
	let regexStr = path.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&");

	// 2. 匹配 :paramName → ([^/]+)
	regexStr = regexStr.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
		paramNames.push(name);
		return "([^/]+)";
	});

	// 3. 匹配 *wildcardName → (.*)
	regexStr = regexStr.replace(/\*([A-Za-z0-9_]+)/g, (_, name) => {
		paramNames.push(name);
		return "(.*)";
	});

	// 4. 整体加锚点
	const regex = new RegExp(`^${regexStr}$`);
	return { regex, paramNames };
}

export function Router({ routes, default: renderDefault }: RouterOptions) {
	const compiled = routes.map((r) => ({
		def: r,
		...compileRoute(r.path),
	}));

	const outlet = document.createElement("div");

	function onHashChange() {
		const hash = location.hash || "#/";
		for (const { def, regex, paramNames } of compiled) {
			const m = regex.exec(hash);
			if (m) {
				const params: Params = {};
				for (let i = 0; i < paramNames.length; i++) {
					params[paramNames[i]] = decodeURIComponent(m[i + 1]);
				}
				render(def.render(params), outlet);
				return;
			}
		}
		renderDefault && render(renderDefault(hash), outlet);
	}

	window.addEventListener("hashchange", onHashChange);
	queueMicrotask(onHashChange);
	return outlet;
}
