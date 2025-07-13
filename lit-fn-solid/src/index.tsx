/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

// hooks.useHookAdapter(new SolidHooksAdapter() as hooks.BasicHooksAdapter);

const root = document.getElementById("root");

render(() => <App />, root!);
