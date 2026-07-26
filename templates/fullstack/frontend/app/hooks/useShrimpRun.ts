// Hook utama ShrimpRun , mengelola state game, fisika, dan collision.
// Logic fisika dan konstanta dipisah ke app/lib/gameData.ts dan app/lib/gameUtils.ts.
// NOTE: useState, useEffect, useRef di-auto-import oleh Rakta.js.

import {
	GAME_PHYSICS,
	HIGH_SCORE_KEY,
	OBSTACLE_CONFIG,
	type ObstaclePosition,
	type ObstacleSizeClass,
	SIM_SPEED_MULTIPLIER,
	type SimSpeed,
} from "../lib/gameData";
import {
	calculateObstacleSpeed,
	checkCollision,
	getRandomObstacleSize,
	readHighScore,
	saveHighScore,
} from "../lib/gameUtils";

export function useShrimpRun() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(() =>
		readHighScore(HIGH_SCORE_KEY),
	);
	const [hasCollision, setHasCollision] = useState(false);
	const [liveFps, setLiveFps] = useState(144.0);
	const [simSpeed, setSimSpeed] = useState<SimSpeed>("NORMAL");

	const [playerY, setPlayerY] = useState(GAME_PHYSICS.playerStartY / 2);
	const [obstacleX, setObstacleX] = useState(OBSTACLE_CONFIG.startX);
	const [obstaclePos, setObstaclePos] = useState<ObstaclePosition>("BOTTOM");
	const [obstaclePalette, setObstaclePalette] = useState(0);
	const [obstacleVariant, setObstacleVariant] = useState(0);
	const [obstacleScaleX, setObstacleScaleX] = useState(1);
	const [obstacleHeight, setObstacleHeight] = useState(95);
	const [obstacleWidth, setObstacleWidth] = useState(64);
	const [obstacleSizeClass, setObstacleSizeClass] =
		useState<ObstacleSizeClass>("SEDANG");

	const playerYRef = useRef(GAME_PHYSICS.playerStartY / 2);
	const obstacleXRef = useRef(OBSTACLE_CONFIG.startX);
	const obstaclePosRef = useRef<ObstaclePosition>("BOTTOM");
	const obstacleHeightRef = useRef(95);
	const obstacleWidthRef = useRef(64);
	const obstaclePaletteRef = useRef(0);
	const obstacleVariantRef = useRef(0);
	const obstacleScaleXRef = useRef(1);
	const obstacleSizeClassRef = useRef<ObstacleSizeClass>("SEDANG");

	const isPlayingRef = useRef(false);
	const velocityRef = useRef(0);
	const scoreRef = useRef(0);
	const gameLoopId = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(0);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	const triggerJump = () => {
		if (!isPlayingRef.current) {
			startSimulation();
			return;
		}
		velocityRef.current = GAME_PHYSICS.jumpVelocity;
	};

	const startSimulation = () => {
		playerYRef.current = GAME_PHYSICS.playerStartY;
		velocityRef.current = GAME_PHYSICS.startVelocity;
		obstacleXRef.current = OBSTACLE_CONFIG.startX;
		obstaclePosRef.current = "BOTTOM";

		const newSize = getRandomObstacleSize("BOTTOM");
		obstacleHeightRef.current = newSize.height;
		obstacleWidthRef.current = newSize.width;
		obstaclePaletteRef.current = Math.floor(Math.random() * 4);
		obstacleVariantRef.current = Math.floor(Math.random() * 3);
		obstacleScaleXRef.current = Math.random() > 0.5 ? 1 : -1;
		obstacleSizeClassRef.current = newSize.sizeClass;

		scoreRef.current = 0;

		setPlayerY(GAME_PHYSICS.playerStartY);
		setObstacleX(OBSTACLE_CONFIG.startX);
		setObstaclePos("BOTTOM");
		setObstacleHeight(newSize.height);
		setObstacleWidth(newSize.width);
		setObstaclePalette(obstaclePaletteRef.current);
		setObstacleVariant(obstacleVariantRef.current);
		setObstacleScaleX(obstacleScaleXRef.current);
		setObstacleSizeClass(newSize.sizeClass);
		setScore(0);
		setHasCollision(false);
		setIsPlaying(true);
	};

	useEffect(() => {
		lastTimeRef.current = performance.now();

		const gameTick = (time: number) => {
			const delta = (time - lastTimeRef.current) / 1000;
			lastTimeRef.current = time;

			if (delta > 0 && delta < 0.1) {
				const currentFps = 1 / delta;
				setLiveFps(
					(prev) => Math.round((prev * 0.9 + currentFps * 0.1) * 10) / 10,
				);
			}

			if (isPlayingRef.current) {
				// Fisika: gravitasi dan batas layar
				velocityRef.current -= GAME_PHYSICS.gravity;
				playerYRef.current += velocityRef.current;

				if (playerYRef.current <= GAME_PHYSICS.playerMinY) {
					playerYRef.current = GAME_PHYSICS.playerMinY;
					velocityRef.current = 0;
				}
				if (playerYRef.current >= GAME_PHYSICS.playerMaxY) {
					playerYRef.current = GAME_PHYSICS.playerMaxY;
					velocityRef.current = GAME_PHYSICS.playerBounceVelocity;
				}

				// Kecepatan obstacle: naik 5% setiap 5 poin, maksimal 2.5x
				const currentObstacleSpeed = calculateObstacleSpeed(
					scoreRef.current,
					SIM_SPEED_MULTIPLIER[simSpeed],
				);

				obstacleXRef.current -= currentObstacleSpeed;

				// Reset obstacle ketika keluar layar dan tambah skor
				if (obstacleXRef.current < OBSTACLE_CONFIG.resetX) {
					obstacleXRef.current = OBSTACLE_CONFIG.startX;
					const nextPos: ObstaclePosition =
						Math.random() > 0.5 ? "TOP" : "BOTTOM";
					obstaclePosRef.current = nextPos;

					const newSize = getRandomObstacleSize(nextPos);
					obstacleHeightRef.current = newSize.height;
					obstacleWidthRef.current = newSize.width;
					obstaclePaletteRef.current = Math.floor(Math.random() * 4);
					obstacleVariantRef.current = Math.floor(Math.random() * 3);
					obstacleScaleXRef.current = Math.random() > 0.5 ? 1 : -1;
					obstacleSizeClassRef.current = newSize.sizeClass;

					setObstaclePos(nextPos);
					setObstacleHeight(newSize.height);
					setObstacleWidth(newSize.width);
					setObstaclePalette(obstaclePaletteRef.current);
					setObstacleVariant(obstacleVariantRef.current);
					setObstacleScaleX(obstacleScaleXRef.current);
					setObstacleSizeClass(newSize.sizeClass);

					scoreRef.current += 1;
					setScore(scoreRef.current);

					if (scoreRef.current > highScore) {
						setHighScore(scoreRef.current);
						saveHighScore(HIGH_SCORE_KEY, scoreRef.current);
					}
				}

				setPlayerY(playerYRef.current);
				setObstacleX(obstacleXRef.current);

				// Cek tabrakan
				const isYCollision = checkCollision(
					playerYRef.current,
					obstacleXRef.current,
					obstacleWidthRef.current,
					obstacleHeightRef.current,
					obstaclePosRef.current,
				);

				if (isYCollision) {
					setHasCollision(true);
					setIsPlaying(false);
				}
			}

			gameLoopId.current = requestAnimationFrame(gameTick);
		};

		gameLoopId.current = requestAnimationFrame(gameTick);
		return () => {
			if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
		};
	}, [highScore, simSpeed]);

	return {
		isPlaying,
		score,
		highScore,
		hasCollision,
		liveFps,
		simSpeed,
		setSimSpeed,
		playerY,
		obstacleX,
		obstaclePos,
		obstacleHeight,
		obstacleWidth,
		obstaclePalette,
		obstacleVariant,
		obstacleScaleX,
		obstacleSizeClass,
		startSimulation,
		triggerJump,
	};
}
