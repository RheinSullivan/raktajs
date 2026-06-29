import { useCallback, useEffect, useRef, useState } from "react";
import RaktaShrimpMascot from "./raktaShrimpMascot";

// ─── Types ────────────────────────────────────────────────────────────────────

type GameStatus = "idle" | "running" | "dead";

interface ObstacleState {
	readonly id: number;
	readonly xPosition: number;
	readonly width: number;
	readonly height: number;
}

interface ShrimpState {
	readonly yPosition: number;
	readonly velocityY: number;
	readonly isJumping: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 160;
const GROUND_STRIP_HEIGHT = 4;
const SHRIMP_START_X = 60;
const SHRIMP_WIDTH = 48;
const SHRIMP_HEIGHT = 48;
const GRAVITY = 1.4;
const JUMP_VELOCITY = -18;
const INITIAL_OBSTACLE_SPEED = 5;
const SPEED_INCREMENT_PER_SCORE = 0.003;
const OBSTACLE_SPAWN_INTERVAL_MS = 1600;
const SCORE_TICK_MS = 80;
const COLLISION_MARGIN = 8;

// ─── Physics helpers ──────────────────────────────────────────────────────────

function getObstacleSpeed(currentScore: number): number {
	return INITIAL_OBSTACLE_SPEED + currentScore * SPEED_INCREMENT_PER_SCORE;
}

function checkCollision(
	shrimpYPosition: number,
	obstacle: ObstacleState,
): boolean {
	const shrimpLeft = SHRIMP_START_X + COLLISION_MARGIN;
	const shrimpRight = SHRIMP_START_X + SHRIMP_WIDTH - COLLISION_MARGIN;
	const shrimpTop =
		CANVAS_HEIGHT -
		GROUND_STRIP_HEIGHT -
		shrimpYPosition -
		SHRIMP_HEIGHT +
		COLLISION_MARGIN;
	const shrimpBottom = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT - shrimpYPosition;

	const obstacleLeft = obstacle.xPosition + COLLISION_MARGIN;
	const obstacleRight = obstacle.xPosition + obstacle.width - COLLISION_MARGIN;
	const obstacleTop = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT - obstacle.height;
	const obstacleBottom = CANVAS_HEIGHT - GROUND_STRIP_HEIGHT;

	return (
		shrimpLeft < obstacleRight &&
		shrimpRight > obstacleLeft &&
		shrimpTop < obstacleBottom &&
		shrimpBottom > obstacleTop
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ShrimpRun — Default Rakta.js interactive starter game.
 *
 * Like the Chrome offline Dino game, but the dinosaur is an animated shrimp.
 * Press Space or click the game canvas to jump. Avoid the red obstacles!
 *
 * Features:
 * - React state only — no external game library
 * - requestAnimationFrame game loop
 * - Physics: gravity + jump velocity
 * - Score that increases over time
 * - Speed ramps up as score grows
 * - Collision detection with margin
 * - High score tracked in component state
 * - Keyboard (Space) and click/tap support
 * - Accessible button game canvas
 * - SVG shrimp mascot — no external assets
 */
export default function ShrimpRunGame() {
	const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
	const [shrimp, setShrimp] = useState<ShrimpState>({
		yPosition: 0,
		velocityY: 0,
		isJumping: false,
	});

	const gameStatusRef = useRef<GameStatus>("idle");
	const scoreRef = useRef(0);
	const shrimpRef = useRef<ShrimpState>({
		yPosition: 0,
		velocityY: 0,
		isJumping: false,
	});
	const obstaclesRef = useRef<ObstacleState[]>([]);
	const obstacleIdRef = useRef(0);
	const animationFrameRef = useRef<number>(0);
	const lastObstacleTimeRef = useRef(0);
	const lastScoreTickRef = useRef(0);

	const jump = useCallback((): void => {
		if (gameStatusRef.current === "dead") {
			return;
		}

		if (gameStatusRef.current === "idle") {
			gameStatusRef.current = "running";
			setGameStatus("running");
		}

		if (!shrimpRef.current.isJumping) {
			const nextShrimp: ShrimpState = {
				...shrimpRef.current,
				velocityY: JUMP_VELOCITY,
				isJumping: true,
			};

			shrimpRef.current = nextShrimp;
			setShrimp(nextShrimp);
		}
	}, []);

	const resetGame = useCallback((): void => {
		const freshShrimp: ShrimpState = {
			yPosition: 0,
			velocityY: 0,
			isJumping: false,
		};

		shrimpRef.current = freshShrimp;
		obstaclesRef.current = [];
		obstacleIdRef.current = 0;
		scoreRef.current = 0;
		gameStatusRef.current = "idle";
		lastObstacleTimeRef.current = 0;
		lastScoreTickRef.current = 0;

		setShrimp(freshShrimp);
		setObstacles([]);
		setScore(0);
		setGameStatus("idle");
	}, []);

	useEffect(() => {
		let previousTimestamp = 0;

		function gameTick(timestamp: number): void {
			if (gameStatusRef.current !== "running") {
				animationFrameRef.current = requestAnimationFrame(gameTick);
				return;
			}

			const deltaTime = timestamp - previousTimestamp;
			previousTimestamp = timestamp;

			if (deltaTime > 100) {
				animationFrameRef.current = requestAnimationFrame(gameTick);
				return;
			}

			const currentShrimp = shrimpRef.current;
			let nextVelocityY = currentShrimp.velocityY + GRAVITY;
			let nextYPosition = currentShrimp.yPosition - nextVelocityY;

			if (nextYPosition <= 0) {
				nextYPosition = 0;
				nextVelocityY = 0;
			}

			const nextShrimp: ShrimpState = {
				yPosition: nextYPosition,
				velocityY: nextVelocityY,
				isJumping: nextYPosition > 0,
			};

			shrimpRef.current = nextShrimp;
			setShrimp(nextShrimp);

			const obstacleSpeed = getObstacleSpeed(scoreRef.current);

			const movedObstacles = obstaclesRef.current
				.map((obstacle) => ({
					...obstacle,
					xPosition: obstacle.xPosition - obstacleSpeed,
				}))
				.filter((obstacle) => obstacle.xPosition + obstacle.width > -10);

			if (
				timestamp - lastObstacleTimeRef.current > OBSTACLE_SPAWN_INTERVAL_MS &&
				movedObstacles.length < 3
			) {
				const obstacleHeight = 30 + Math.floor(Math.random() * 30);
				const obstacleWidth = 20 + Math.floor(Math.random() * 20);

				movedObstacles.push({
					id: obstacleIdRef.current,
					xPosition: CANVAS_WIDTH + 20,
					width: obstacleWidth,
					height: obstacleHeight,
				});

				obstacleIdRef.current += 1;
				lastObstacleTimeRef.current = timestamp;
			}

			obstaclesRef.current = movedObstacles;
			setObstacles([...movedObstacles]);

			for (const obstacle of movedObstacles) {
				if (checkCollision(nextShrimp.yPosition, obstacle)) {
					gameStatusRef.current = "dead";
					setGameStatus("dead");
					setHighScore((previousHighScore) =>
						Math.max(previousHighScore, scoreRef.current),
					);
					animationFrameRef.current = requestAnimationFrame(gameTick);
					return;
				}
			}

			if (timestamp - lastScoreTickRef.current > SCORE_TICK_MS) {
				scoreRef.current += 1;
				setScore(scoreRef.current);
				lastScoreTickRef.current = timestamp;
			}

			animationFrameRef.current = requestAnimationFrame(gameTick);
		}

		animationFrameRef.current = requestAnimationFrame(gameTick);

		return () => {
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, []);

	useEffect(() => {
		function handleKeyDown(keyboardEvent: KeyboardEvent): void {
			if (keyboardEvent.code === "Space") {
				keyboardEvent.preventDefault();
				jump();
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [jump]);

	const shrimpBottomOffset = GROUND_STRIP_HEIGHT + shrimp.yPosition;
	const isDead = gameStatus === "dead";
	const isIdle = gameStatus === "idle";
	const isRunning = gameStatus === "running";

	return (
		<div className="shrimp-run-wrapper">
			<div
				style={{
					display: "flex",
					gap: "2rem",
					alignItems: "center",
				}}
			>
				<span className="shrimp-run-score">Score: {score}</span>
				{highScore > 0 && (
					<span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
						Best: {highScore}
					</span>
				)}
			</div>

			<button
				type="button"
				className="shrimp-run-canvas"
				aria-label="ShrimpRun game area. Click or press Space to jump."
				onClick={jump}
				onKeyDown={(keyboardEvent) => {
					if (keyboardEvent.code === "Space") {
						keyboardEvent.preventDefault();
						jump();
					}
				}}
				style={{
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT,
					position: "relative",
					background: "#0e111a",
					borderRadius: 16,
					border: "2px solid rgba(220,38,38,0.3)",
					overflow: "hidden",
					cursor: "pointer",
					userSelect: "none",
					padding: 0,
					display: "block",
					textAlign: "left",
				}}
			>
				<span
					className="shrimp-run-ground"
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						width: "100%",
						height: GROUND_STRIP_HEIGHT,
						background: "#dc2626",
						borderRadius: "2px",
					}}
				/>

				<span
					style={{
						position: "absolute",
						left: SHRIMP_START_X,
						bottom: shrimpBottomOffset,
						width: SHRIMP_WIDTH,
						height: SHRIMP_HEIGHT,
					}}
				>
					<RaktaShrimpMascot isJumping={shrimp.isJumping} isDead={isDead} />
				</span>

				{obstacles.map((obstacle) => (
					<span
						key={obstacle.id}
						style={{
							position: "absolute",
							left: obstacle.xPosition,
							bottom: GROUND_STRIP_HEIGHT,
							width: obstacle.width,
							height: obstacle.height,
							background: "#dc2626",
							borderRadius: "4px 4px 0 0",
						}}
					/>
				))}

				{isIdle && (
					<span
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#94a3b8",
							fontSize: "0.875rem",
							pointerEvents: "none",
						}}
					>
						Press Space or click to start
					</span>
				)}

				{isDead && (
					<span
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
							background: "rgba(5, 5, 5, 0.75)",
						}}
					>
						<span
							style={{
								color: "#dc2626",
								fontWeight: 700,
								fontSize: "1.125rem",
								letterSpacing: "0.1em",
							}}
						>
							GAME OVER
						</span>
						<span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
							Score: {score}
						</span>
					</span>
				)}

				{isRunning && score > 0 && score % 50 === 0 && (
					<span
						style={{
							position: "absolute",
							top: 8,
							right: 12,
							color: "#dc2626",
							fontWeight: 700,
							fontSize: "0.75rem",
							letterSpacing: "0.1em",
							opacity: 0.8,
						}}
					>
						{score}!
					</span>
				)}
			</button>

			<p className="shrimp-run-message">
				{isIdle && "🦐 Click or press Space to make the shrimp jump!"}
				{isRunning && "🦐 Don't hit the obstacles!"}
				{isDead && "The shrimp got cooked. Try again!"}
			</p>

			{isDead && (
				<button
					type="button"
					className="shrimp-run-restart"
					onClick={resetGame}
				>
					Restart
				</button>
			)}
		</div>
	);
}
