type LitNothing = typeof import("lit").nothing;
export interface Enuml<T extends Record<string, Record<string, any>>> {
	<K extends keyof T>(type: K, payload: T[K]): Case<T, K>;
}

export type Case<
	T extends Record<string, Record<string, any>>,
	K extends keyof T
> = {
	type: K;
	payload: T[K];
};

export type ToUnkownCase<T> = T extends Case<infer U, infer _K>
	? { [K in keyof U]: Case<U, K> }[keyof U]
	: never;

export function enuml<
	T extends Record<string, Record<string, any>>
>(): Enuml<T> {
	return <K extends keyof T>(type: K, payload: T[K]): Case<T, K> => {
		return { type, payload: { ...payload } } as any;
	};
}
type PayloadOf<T, K extends string> = T extends {
	type: K;
	payload: infer P;
}
	? P
	: never;
type Handers<T extends { type: K }, K extends string = T["type"]> = {
	[P in K]: (data: PayloadOf<T, P>) => any;
};

export function match<
	T extends { type: K; payload: any },
	H extends Handers<T, K>,
	K extends string = T["type"],
	R = ReturnType<H[K]>
>(value: T, handlers: H): R {
	const { type } = value;
	const handler = handlers[type as keyof Handers<T, K>];
	if (!handler) {
		throw new Error(`No handler for type: ${value.type}`);
	}
	return handler(value.payload) as R;
}
export type MatchLazy<
	T extends () => { type: K; payload: any },
	H extends Handers<ReturnType<T>, K>,
	K extends string = ReturnType<T>["type"],
	R = ReturnType<H[K]>
> = () => R;
export function matchLazy<
	T extends () => { type: K; payload: any },
	H extends Handers<ReturnType<T>, K>,
	K extends string = ReturnType<T>["type"],
	R = ReturnType<H[K]>
>(matchFn: T, handlers: H): MatchLazy<T, H, K, R> {
	const hander = () => {
		const value = matchFn();
		return match(value, handlers);
	};
	(hander as any).$__LIT_FN_IS_MATCH_LAZY__ = true;
	return hander;
}
type ResultCase<Type extends "Ok" | "Err", Value> = Case<
	{
		Ok: {
			value: Value;
		};
		Err: {
			message: string | LitNothing;
		};
	},
	Type
> & {
	isOk(): this is {
		type: "Ok";
		payload: {
			value: Value;
		};
		isOk(): true;
		isErr(): false;
	};
	isErr(): this is {
		type: "Err";
		payload: {
			message: LitNothing;
		};
		isOk(): false;
		isErr(): true;
	};
};
const ResultBuilder = <Type extends "Ok" | "Err", Value>(
	type: Type,
	payload: any
): ResultCase<Type, Value> => {
	const base = enuml<{
		Ok: { value: Value };
		Err: { message: LitNothing };
	}>()(type, payload) as ResultCase<Type, Value>;
	const result = Object.assign(base, {
		isOk(): this is ResultCase<"Ok", Value> {
			return type === "Ok";
		},
		isErr(): this is ResultCase<"Err", Value> {
			return type === "Err";
		},
	}) satisfies ResultCase<Type, Value>;
	return result;
};

export const Result = {
	Ok: <Value>(value: Value): ResultCase<"Ok", Value> =>
		ResultBuilder("Ok", { value }),
	Err: (message: string | LitNothing) =>
		ResultBuilder("Err", { message }) as ResultCase<"Err", string>,
};

function test() {
	const okOrErr = () =>
		Math.random() > 0.5 ? Result.Ok(1) : Result.Err("Error");

	console.log(okOrErr().isErr());
	console.log(okOrErr().isOk());

	const matchResult = match(okOrErr(), {
		Ok: ({ value }) => `Got value: ${value}`,
		Err: ({ message }) => `Got error: ` + message.toString(),
	});

	const matchLazyResult = matchLazy(okOrErr, {
		Ok: ({ value }) => `Got value: ${value}`,
		Err: ({ message }) => `Got error: ` + message.toString(),
	});

	return { matchResult, matchLazyResult };
}

const { matchResult, matchLazyResult } = test();
console.log(matchResult);
console.log(matchLazyResult());
