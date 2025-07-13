# Signal Implementation Comparison in lit-with-signal

<p align="center">
    <span> English </span> | <a href="./README.zh.md"> 简体中文 </a>
</p>

## Learning Curve (Cognitive Load)
**@lit-labs/signals** is very easy to get started with. You just need to mixin the SignalWatcher to your component class:
```js
class MyComponent extends SignalWatcher(LitElement) {}
```

**@xignal/lit** focuses on individual values. For each component, you need to map signal values like this:
```js
class MyComponent extends LitElement {
    private count = new UseSignalState(this, countXignal);
}
```
This approach varies by personal preference. In my opinion, when there are many signals in a project and one component corresponds to multiple signals, this writing style can become cumbersome. It also increases the local signal writing cost within components.

## API Completeness
**@lit-labs/signals** is a reactive wrapper over signals-polyfill, implementing most requirements from the signals proposal. It also has good integration with **signal-utils**.

**@xignal/lit** is not a direct wrapper over signals-polyfill, but it still implements all requirements from the proposal. However, its interoperability with other signal libraries is limited. Fortunately, more libraries like **alien-signals** are gaining popularity and show great promise.

## Performance
**@lit-labs/signals** is a thin wrapper over signals-polyfill (which isn't the fastest signal implementation), but has minimal abstraction layers.

**@xignal/lit** is a thin wrapper over alien-signals, which claims to be the fastest signal implementation. Alien-signals' core algorithm has even been adopted by Vue 3.6, making it currently (as of 2025-07-13) one of the fastest reactivity solutions available.

## Conclusion
For better development efficiency, consider using **@lit-labs/signals**. For better runtime performance, you might consider using **@xignal/lit**. However, I strongly recommend using **@lit-labs/signals** because:
1. It's officially maintained by the Lit team
2. Signal handling itself isn't a performance bottleneck
3. Using @xignal/lit just for performance gains would increase cognitive load unnecessarily
