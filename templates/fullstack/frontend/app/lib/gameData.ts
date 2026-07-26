// Game constants dan data untuk ShrimpRun
// Pisahkan dari useShrimpRun.ts supaya hook tetap fokus ke logic saja.

export type SimSpeed = "NORMAL" | "FAST" | "TURBO";
export type ObstaclePosition = "TOP" | "BOTTOM";
export type ObstacleSizeClass = "KECIL" | "SEDANG" | "BESAR";

// Konstanta fisika game
export const GAME_PHYSICS = {
	gravity: 0.28,
	jumpVelocity: 6.2,
	startVelocity: 4.0,
	playerStartY: 80,
	playerMinY: 0,
	playerMaxY: 165,
	playerBounceVelocity: -0.5,
} as const;

// Konstanta obstacle
export const OBSTACLE_CONFIG = {
	startX: 100,
	resetX: -15,
	baseSpeed: 0.65,
	maxSpeedMultiplier: 2.5,
	speedScoreInterval: 5, // kenaikan speed setiap N poin
	speedIncrement: 0.05, // +5% per interval
} as const;

// Multiplier per mode kecepatan
export const SIM_SPEED_MULTIPLIER: Record<SimSpeed, number> = {
	NORMAL: 1.0,
	FAST: 1.4,
	TURBO: 1.8,
} as const;

// Ukuran obstacle per size class (px)
export const OBSTACLE_SIZES: Record<
	ObstacleSizeClass,
	{
		heightMin: number;
		heightRange: number;
		widthMin: number;
		widthRange: number;
	}
> = {
	KECIL: { heightMin: 32, heightRange: 8, widthMin: 26, widthRange: 5 },
	SEDANG: { heightMin: 55, heightRange: 10, widthMin: 38, widthRange: 6 },
	BESAR: { heightMin: 75, heightRange: 12, widthMin: 48, widthRange: 6 },
} as const;

// Threshold random untuk size class
export const SIZE_THRESHOLDS = {
	small: 0.33,
	medium: 0.67,
} as const;

// Hitbox shrimp (dalam % lebar viewport)
export const SHRIMP_HITBOX = {
	xPercent: 15,
	widthPercent: 8,
	heightPx: 28,
} as const;

// localStorage key
export const HIGH_SCORE_KEY = "rakta_shrimprun_highscore";
