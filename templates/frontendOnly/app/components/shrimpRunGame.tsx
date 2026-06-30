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
const MAX_CONCURRENT_OBSTACLES = 3;
const FRAME_SKIP_THRESHOLD_MS = 100;

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

			if (deltaTime > FRAME_SKIP_THRESHOLD_MS) {
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
				.map(
					(obstacle): ObstacleState => ({
						...obstacle,
						xPosition: obstacle.xPosition - obstacleSpeed,
					}),
				)
				.filter((obstacle) => obstacle.xPosition + obstacle.width > -10);

			if (
				timestamp - lastObstacleTimeRef.current > OBSTACLE_SPAWN_INTERVAL_MS &&
				movedObstacles.length < MAX_CONCURRENT_OBSTACLES
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
					setHighScore((previousHighScore: number) =>
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
		<div className="flex flex-col items-start gap-4 py-4">
			<div className="flex flex-wrap items-center gap-8">
				<span className="font-mono text-xl font-bold tabular-nums text-red-600">
					Score: {score}
				</span>
				{highScore > 0 && (
					<span className="text-sm text-slate-400">Best: {highScore}</span>
				)}
			</div>

			<button
				type="button"
				className="relative block max-w-full cursor-pointer select-none overflow-hidden rounded-2xl border-2 border-red-600/30 bg-[#0e111a] p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
				aria-label="ShrimpRun game area. Click or press Space to jump."
				onClick={jump}
				onKeyDown={(keyboardEvent: import("react").KeyboardEvent) => {
					if (keyboardEvent.code === "Space") {
						keyboardEvent.preventDefault();
						jump();
					}
				}}
				style={{
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT,
				}}
			>
				<span
					className="absolute bottom-0 left-0 w-full rounded-sm bg-red-600"
					style={{
						height: GROUND_STRIP_HEIGHT,
					}}
				/>

				<span
					className="absolute"
					style={{
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
						className="absolute rounded-t bg-red-600"
						style={{
							left: obstacle.xPosition,
							bottom: GROUND_STRIP_HEIGHT,
							width: obstacle.width,
							height: obstacle.height,
						}}
					/>
				))}

				{isIdle && (
					<span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
						Press Space or click to start
					</span>
				)}

				{isDead && (
					<span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75">
						<span className="text-lg font-bold tracking-widest text-red-600">
							GAME OVER
						</span>
						<span className="text-sm text-slate-400">Score: {score}</span>
					</span>
				)}

				{isRunning && score > 0 && score % 50 === 0 && (
					<span className="absolute right-3 top-2 text-xs font-bold tracking-widest text-red-600 opacity-80">
						{score}!
					</span>
				)}
			</button>

			<p className="min-h-5 text-sm text-slate-400">
				{isIdle && "Click or press Space to make the shrimp jump!"}
				{isRunning && "Don't hit the obstacles!"}
				{isDead && "The shrimp got cooked. Try again!"}
			</p>

			{isDead && (
				<button
					type="button"
					className="w-fit rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700 active:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
					onClick={resetGame}
				>
					Restart
				</button>
			)}
		</div>
	);
}
