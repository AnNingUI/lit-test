import confetti from "canvas-confetti";
import { css, html } from "lit";
import {
	createComponent,
	useCallback,
	useEffect,
	useInterval,
	useState,
} from "lit-fn";

export const GamePage = createComponent(
	() => {
		// 普通模式状态
		const [score, setScore] = useState(0);
		const [timeLeft, setTimeLeft] = useState(30);
		const [isPlaying, setIsPlaying] = useState(false);
		const [moles, setMoles] = useState(Array(9).fill(false));

		// 普通模式：显示随机地鼠
		const showRandomMole = useCallback(() => {
			if (!isPlaying) return;
			setMoles(() => {
				const newMoles = Array(9).fill(false);
				const count = Math.floor(Math.random() * 2) + 1;
				for (let i = 0; i < count; i++) {
					newMoles[Math.floor(Math.random() * 9)] = true;
				}
				return newMoles;
			});
		}, [isPlaying]);

		// 普通模式：打地鼠
		const handleWhack = (index: number) => {
			if (!isPlaying) return;
			setMoles((ms) => {
				if (!ms[index]) return ms;
				const next = [...ms];
				next[index] = false;
				return next;
			});
			setScore((s) => s + 1);
			confetti({
				particleCount: 200,
				spread: 90,
				origin: { y: 0.6 },
				colors: ["#FF4500", "#00BFFF", "#32CD32", "#FFD700", "#8A2BE2"],
				scalar: 1.2,
				ticks: 200,
			});
		};

		// 开始游戏（普通 & 特殊共用）
		const startGame = () => {
			setScore(0);
			setTimeLeft(30);
			setIsPlaying(true);
			setMoles(Array(9).fill(false));
		};

		// 计时器
		useEffect(() => {
			if (!isPlaying) return;
			if (timeLeft > 0) {
				const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
				return () => clearTimeout(timer);
			}
			// 时间到
			setIsPlaying(false);
			setMoles(Array(9).fill(false));
		}, [timeLeft, isPlaying]);

		// 普通模式间隔
		// @ts-ignore
		useInterval(showRandomMole, isPlaying ? 1000 : null);

		return html`
			<div class="game-container">
				<h1>打地鼠游戏</h1>
				<game-controls
					.score=${score}
					.timeLeft=${timeLeft}
					.isPlaying=${isPlaying}
					.onStart=${startGame}
				></game-controls>

				<div class="game-board">
					${moles.map(
						(active, idx) => html`
							<mole-hole
								.active=${active}
								.index=${idx}
								.onWhack=${handleWhack}
								.isPlaying=${isPlaying}
							></mole-hole>
						`
					)}
				</div>
				${timeLeft === 0
					? html`
							<dialog open class="game-over">
								<h2>游戏结束!</h2>
								<p>你的得分: ${score}</p>
								<button @click=${startGame} class="restart-button">
									再玩一次
								</button>
							</dialog>
					  `
					: ""}
			</div>
		`;
	},
	{
		style: css`
			.game-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				font-family: "Arial", sans-serif;
				max-width: 500px;
				margin: 0 auto;
				padding: 20px;
				user-select: none;
			}

			h1 {
				color: #333;
				margin-bottom: 20px;
			}

			.mode-switch {
				margin-bottom: 10px;
			}
			.mode-button {
				padding: 8px 16px;
				font-size: 1rem;
				cursor: pointer;
			}

			.game-board {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 10px;
				margin-top: 20px;
			}

			.game-over {
				top: 50%;
				bottom: 50%;
				background-color: rgba(255, 255, 255, 0.9);
				padding: 30px;
				border-radius: 10px;
				text-align: center;
				box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
				z-index: 10;
			}

			.restart-button {
				padding: 10px 20px;
				font-size: 1.2rem;
				background-color: #2196f3;
				color: white;
				border: none;
				border-radius: 5px;
				cursor: pointer;
				margin-top: 15px;
			}
			.restart-button:hover {
				background-color: #0b7dda;
			}

			@media (max-width: 768px) {
				.game-container {
					transform: scale(0.8);
				}
			}
		`,
	}
);
