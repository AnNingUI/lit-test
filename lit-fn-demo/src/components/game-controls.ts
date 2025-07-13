import { css, html } from "lit";
import { createComponent } from "lit-fn";

export const GameControls = createComponent(
	(props: {
		score: number;
		timeLeft: number;
		isPlaying: boolean;
		onStart: () => void;
	}) => {
		const { score, timeLeft, isPlaying, onStart } = props;

		return html`
			<div class="game-controls">
				<div class="stats">
					<div class="score">得分: ${score}</div>
					<div class="timer">时间: ${timeLeft}秒</div>
				</div>

				${!isPlaying
					? html`<button @click=${onStart} class="start-button">
							开始游戏
					  </button>`
					: html`<div class="game-message">快点击地鼠!</div>`}
			</div>
		`;
	},
	{
		props: ["score", "timeLeft", "isPlaying", "onStart"],
		style: css`
			.game-controls {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-bottom: 20px;
			}

			.stats {
				display: flex;
				justify-content: space-between;
				width: 100%;
				max-width: 340px;
				margin-bottom: 15px;
				font-size: 1.2rem;
				font-weight: bold;
			}

			.start-button {
				padding: 10px 20px;
				font-size: 1.2rem;
				background-color: #4caf50;
				color: white;
				border: none;
				border-radius: 5px;
				cursor: pointer;
			}

			.start-button:hover {
				background-color: #45a049;
			}

			.game-message {
				font-size: 1.2rem;
				font-weight: bold;
				color: #ff5722;
			}
		`,
	}
);
