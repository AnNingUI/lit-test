# Signal实现在lit中的比较

<p align="center">
    <a href="./README.md"> English </a> | <span> 简体中文 </span>
</p>

## 使用成本(心智负担)
**@lit-labs/signals**上手简单只需要将组件类通过SignalWatcher进行Mixin，就可以完全享受signals带来的响应式处理
```js
class MyComponent extends SignalWatcher(LitElement) {}
```
**@xignal/lit**则是将响应式的关注点放到了每个值上，在每个组件都需要在组件类中通过
```js
class MyComponent extends LitElement {
    private count = new UseSignalState(this, countXignal);
}
```
这样的一种写法来映射对信号量的set，这种写法因人而异，在我看来如果项目中信号量过多是，刚好一个组件对应多个信号量时编写起来会比较麻烦，而且也因如此，组件内局部信号量的编写成本也会增加

## API完善度
**@lit-labs/signals**是对signals-polyfill的一层响应式封装，基本上signals提案中的要求都有实现，而且因此还对**signal-utils**有一定联动性
**@xignal/lit**虽然不是对signals-polyfill的响应式封装，但是也对提案中的要求都有实现，但是和其他信号量的库的联动性不够，但好在使用**alien-signals**的库越来越多，前途无量

## 使用效率与性能
**@lit-labs/signals**是对signal-polyfill的一层浅层封装，signal-polyfill不是最快的signal实现，但是抽象层较少
**@xignal/lit**是对alien-signals的一层浅层封装，alien-signals号称最快的signal实现，像**vue3.6**内部也改用了他的核心算法后成为了现在(至我编写时间2025-7-13)最快的响应式，可见他的优势

## 总结
为了编写效率可以考虑使用**@lit-labs/signals**，为了运行效率可以酌情考虑使用**@xignal/lit**，但是我更加推荐使用**@lit-labs/signals**，因为他的优势是官方维护，加上信号量的处理本身不是什么性能怪物，不必为了性能而使用**@xignal/lit**徒增心智负担。