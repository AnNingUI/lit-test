import { css, html } from "lit";
import { createComponent, useRef } from "lit-fn";
const audio = new Audio("/public/sounds/whack.wav");

export const MoleHole = createComponent(
	(props: {
		active: boolean;
		index: number;
		onWhack: (index: number) => void;
		isPlaying: boolean;
	}) => {
		const { active, index, onWhack, isPlaying } = props;
		const holeRef = useRef<HTMLDivElement | null>(null);

		// 点击地鼠
		const handleClick = () => {
			if (active && isPlaying) {
				onWhack(index);
				audio.currentTime = 0;
				audio.play();
				// 添加点击动画效果
				if (holeRef.current) {
					holeRef.current.classList.add("whacked");
					setTimeout(() => {
						holeRef.current?.classList.remove("whacked");
					}, 300);
				}
			}
		};

		const moleElement = holeRef.current?.querySelector(".mole");
		if (moleElement) {
			moleElement.addEventListener("dragstart", (e) => e.preventDefault());
		}

		return html`
			<div
				class="mole-hole ${active ? "active" : ""}"
				ref=${(el: HTMLDivElement) => (holeRef.current = el)}
				@click=${handleClick}
			>
				<div class="mole"></div>
				<div class="hole"></div>
			</div>
		`;
	},
	{
		props: ["active", "index", "onWhack", "isPlaying"],
		style: css`
			/* 基础布局 */
			.mole-hole {
				position: relative;
				width: 120px;
				height: 120px;
				margin: 10px;
				cursor: pointer;
				filter: hue-rotate(0deg);
				animation: hue-rotate 5s infinite linear;
			}

			/* 洞口 */
			.hole {
				position: absolute;
				bottom: 0;
				width: 100%;
				height: 40px;
				background: #222;
				border-radius: 50% 50% 0 0;
				overflow: hidden;
				z-index: 1;
				box-shadow: 0 0 8px cyan, inset 0 0 10px purple;
				-webkit-user-drag: none; /* 禁止拖动 */
				user-select: none; /* 禁止文本/元素被选中 */
			}

			/* 地鼠本体 */
			.mole {
				position: absolute;
				bottom: 0;
				width: 100px;
				height: 0;
				background: linear-gradient(45deg, #ff0077, #00ffff);
				border-radius: 50% 50% 0 0;
				left: 10px;
				transition: height 0.2s ease-out, box-shadow 0.2s;
				z-index: 2;
				box-shadow: 0 0 12px #ff0077, 0 0 20px #00ffff;
				-webkit-user-drag: none; /* 禁止拖动 */
				user-select: none; /* 禁止文本/元素被选中 */
			}

			/* 弹出动画 */
			.active .mole {
				height: 70px;
				bottom: 30px;
				animation: bounce 0.5s ease-out;
			}

			/* 被打击时的闪光/抖动 */
			.whacked {
				animation: whack-shake 0.3s ease-in-out, flash 0.3s ease-out;
			}
			.whacked .mole {
				height: 20px !important;
				transition: none;
			}

			/* 点击粒子伪元素 */
			.whacked::after {
				content: "";
				position: absolute;
				left: 50%;
				top: 40%;
				width: 20px;
				height: 20px;
				background: radial-gradient(circle, #fff 0%, transparent 70%);
				transform: translate(-50%, -50%);
				animation: particle 0.5s forwards;
			}

			/* 色相循环 */
			@keyframes hue-rotate {
				from {
					filter: hue-rotate(0deg);
				}
				to {
					filter: hue-rotate(360deg);
				}
			}

			/* 弹跳效果 */
			@keyframes bounce {
				0% {
					transform: translateY(0);
				}
				50% {
					transform: translateY(-10px);
				}
				100% {
					transform: translateY(0);
				}
			}

			/* 闪光效果 */
			@keyframes flash {
				0%,
				100% {
					box-shadow: 0 0 20px #fff;
				}
				50% {
					box-shadow: 0 0 40px #fff;
				}
			}

			/* 抖动效果 */
			@keyframes whack-shake {
				0%,
				100% {
					transform: translate(0, 0);
				}
				20%,
				60% {
					transform: translate(-4px, 0);
				}
				40%,
				80% {
					transform: translate(4px, 0);
				}
			}

			/* 粒子爆散 */
			@keyframes particle {
				0% {
					opacity: 1;
					transform: translate(-50%, -50%) scale(0.5);
				}
				100% {
					opacity: 0;
					transform: translate(-50%, -50%) scale(3);
				}
			}
		`,
	}
);
