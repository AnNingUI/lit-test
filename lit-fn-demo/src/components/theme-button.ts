import { css, html } from "lit";
import { defineComponent, useState } from "lit-fn";
import { ThemeContext } from "../context";

// Button 组件样式
const buttonStyle = css`
	button {
		padding: 0.6rem 1.2rem;
		font-size: 1rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.3s, color 0.3s;
	}
	button.light {
		background-color: #ffffff;
		color: #333;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}
	button.dark {
		background-color: #333333;
		color: #fff;
		box-shadow: 0 2px 6px rgba(255, 255, 255, 0.1);
	}
`;

export const ThemeButton = defineComponent(
	"theme-button",
	() => {
		const [theme, setTheme] = useState("light");
		const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

		// 提供当前主题值
		return ThemeContext.Provider(theme)(
			html`
				<button class="${theme}" @click=${toggleTheme}>
					Switch to ${theme === "light" ? "dark" : "light"} theme
				</button>
			`
		);
	},
	{ style: buttonStyle }
);
