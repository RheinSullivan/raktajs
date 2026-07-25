

const getRandomObstacleSize = (
	pos: "TOP" | "BOTTOM",
): {
	height: number;
	width: number;
	sizeClass: ObstacleSizeClass;
} => {
	const rand = Math.random();
	let sizeClass: ObstacleSizeClass;
	let height = 60;
	let width = 40;

	if (rand < 0.33) {
		sizeClass = "KECIL";
		height = Math.floor(Math.random() * 8) + 32;
		width = Math.floor(Math.random() * 5) + 26;
	} else if (rand < 0.67) {
		sizeClass = "SEDANG";
		height = Math.floor(Math.random() * 10) + 55;
		width = Math.floor(Math.random() * 6) + 38;
	} else {
		sizeClass = "BESAR";
		height = Math.floor(Math.random() * 12) + 75;
		width = Math.floor(Math.random() * 6) + 48;
	}

	return { height, width, sizeClass };
};

export function useShrimpRun() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(() => {
		try {
			return parseInt(localStorage.getItem("rakta_shrimprun_highscore") || "0", 10);
		} catch {
			return 0;
		}
	});
	const [hasCollision, setHasCollision] = useState(false);
	const [liveFps, setLiveFps] = useState(144.0);
	const [simSpeed, setSimSpeed] = useState<SimSpeed>("NORMAL");

	const [playerY, setPlayerY] = useState(40);
	const [obstacleX, setObstacleX] = useState(100);
	const [obstaclePos, setObstaclePos] = useState<ObstaclePosition>("BOTTOM");
	const [obstaclePalette, setObstaclePalette] = useState(0);
	const [obstacleVariant, setObstacleVariant] = useState(0);
	const [obstacleScaleX, setObstacleScaleX] = useState(1);
	const [obstacleHeight, setObstacleHeight] = useState(95);
	const [obstacleWidth, setObstacleWidth] = useState(64);
	const [obstacleSizeClass, setObstacleSizeClass] = useState<ObstacleSizeClass>("SEDANG");

	const playerYRef = useRef(40);
	const obstacleXRef = useRef(100);
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
		velocityRef.current = 6.2;
	};

	const startSimulation = () => {
		playerYRef.current = 80;
		velocityRef.current = 4.0;
		obstacleXRef.current = 100;
		obstaclePosRef.current = "BOTTOM";

		const newSize = getRandomObstacleSize("BOTTOM");
		obstacleHeightRef.current = newSize.height;
		obstacleWidthRef.current = newSize.width;
		obstaclePaletteRef.current = Math.floor(Math.random() * 4);
		obstacleVariantRef.current = Math.floor(Math.random() * 3);
		obstacleScaleXRef.current = Math.random() > 0.5 ? 1 : -1;
		obstacleSizeClassRef.current = newSize.sizeClass;

		scoreRef.current = 0;

		setPlayerY(80);
		setObstacleX(100);
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
				setLiveFps((prev) => Math.round((prev * 0.9 + currentFps * 0.1) * 10) / 10);
			}

			if (isPlayingRef.current) {
				const gravity = 0.28;
				velocityRef.current -= gravity;
				playerYRef.current += velocityRef.current;

				if (playerYRef.current <= 0) {
					playerYRef.current = 0;
					velocityRef.current = 0;
				}
				if (playerYRef.current >= 165) {
					playerYRef.current = 165;
					velocityRef.current = -0.5;
				}

				const speedMultiplier = simSpeed === "TURBO" ? 1.8 : simSpeed === "FAST" ? 1.4 : 1.0;
				const currentObstacleSpeed = (0.65 + scoreRef.current * 0.02) * speedMultiplier;

				obstacleXRef.current -= currentObstacleSpeed;

				if (obstacleXRef.current < -15) {
					obstacleXRef.current = 100;
					const nextPos: ObstaclePosition = Math.random() > 0.5 ? "TOP" : "BOTTOM";
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
						try {
							localStorage.setItem("rakta_shrimprun_highscore", scoreRef.current.toString());
						} catch {}
					}
				}

				setPlayerY(playerYRef.current);
				setObstacleX(obstacleXRef.current);

				const shrimpXPercent = 15;
				const shrimpWidthPercent = 8;
				const isXOverlap =
					shrimpXPercent + shrimpWidthPercent > obstacleXRef.current &&
					shrimpXPercent < obstacleXRef.current + (obstacleWidthRef.current / 400) * 100;

				let isYCollision = false;
				if (isXOverlap) {
					const obsHeight = obstacleHeightRef.current;
					if (obstaclePosRef.current === "BOTTOM") {
						if (playerYRef.current < obsHeight - 10) {
							isYCollision = true;
						}
					} else {
						const obsTopThreshold = 200 - obsHeight + 10;
						if (playerYRef.current + 28 > obsTopThreshold) {
							isYCollision = true;
						}
					}
				}

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
