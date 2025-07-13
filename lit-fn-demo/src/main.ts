export * from "./components/app-header";
export * from "./components/info-card";
export * from "./components/markdown-viewer";
export * from "./components/theme-button";
export * from "./components/theme-display";
export * from "./pages/about-page";
export * from "./pages/contact-page";
export * from "./pages/demo-page";
export * from "./pages/home-page";
export * from "./pages/not-found";
import { Router } from "@vaadin/router";
import { ChildComponent } from "./components/child-component";
import { GameControls } from "./components/game-controls";
import { MoleHole } from "./components/mole-hole";
import { MyCounter } from "./components/my-counter";
import { ParentComponent } from "./components/parent-component";
import { GamePage } from "./pages/game-page";
// const signalStateMap = new Map<HTMLElement, Signal.State<any>>();
// const setSignalState = (element: HTMLElement, state: Signal.State<any>) => {
// 	signalStateMap.set(element, state);
// };
// const getSignalState = (element: HTMLElement) => {
// 	if (signalStateMap.has(element)) {
// 		return signalStateMap.get(element)!;
// 	} else {
// 		return signal(undefined);
// 	}
// };

// 注册组件
MoleHole.register("mole-hole");
GameControls.register("game-controls");
GamePage.register("game-page");
ChildComponent.register("child-component");
MyCounter.register("my-counter");
ParentComponent.register("parent-component");
// 获取要挂载内容的容器
const outlet = document.getElementById("app")!;
const router = new Router(outlet);

// 配置路由
router.setRoutes([
	{ path: "/", component: "home-page" },
	{ path: "/about", component: "about-page" },
	{ path: "/contact", component: "contact-page" },
	{ path: "/demo", component: "demo-page" },
	{ path: "/game", component: "game-page" },
	{ path: "(.*)", component: "not-found" }, // 通配：404 页面
]);
