import { computed, signal, SignalWatcher } from "@lit-labs/signals";
import { UseSignalState } from "@xignal/lit";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { state, computed as xignalComputed } from "xignal";

/// signal
const countLit = signal(0);
const countXignal = state(0);
const dLit = computed(() => countLit.get() * 2);
const dXignal = xignalComputed(() => countXignal.get() * 2);
///

@customElement("lit-labs-signal")
export class LitLabsSignal extends SignalWatcher(LitElement) {
	#add() {
		countLit.set(countLit.get() + 1);
	}
	render() {
		return html`<div>
			<p>Lit signal: ${countLit.get()}</p>
			<p>Lit computed: ${dLit.get()}</p>
			<button @click=${this.#add}>+</button>
		</div>`;
	}
}

@customElement("xignal-signal")
export class XignalSignal extends LitElement {
	private count = new UseSignalState(this, countXignal);
	#add() {
		this.count.update((count) => count + 1);
	}
	render() {
		return html`<div>
			<p>Xignal signal: ${countXignal.get()}</p>
			<p>Xignal computed: ${dXignal.get()}</p>
			<button @click=${this.#add}>+</button>
		</div> `;
	}
}

@customElement("my-element")
export class MyElement extends LitElement {
	render() {
		return html`<div>
			<lit-labs-signal></lit-labs-signal>
			<xignal-signal></xignal-signal>
			<slot></slot>
		</div>`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"lit-labs-signal": LitLabsSignal;
		"xignal-signal": XignalSignal;
		"my-element": MyElement;
	}
}
