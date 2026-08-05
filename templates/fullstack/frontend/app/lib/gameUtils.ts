// Utility functions untuk ShrimpRun game logic
// Tidak bergantung pada React , bisa ditest secara independen.
// NOTE: Rakta.js Auto Import menyediakan konstanta gameData secara global.

export interface ObstacleSize {
	height: number;
	width: number;
	sizeClass: ObstacleSizeClass;
}

/**
 * Tentukan ukuran obstacle secara acak.
 * Distribusi: 33% kecil, 34% sedang, 33% besar.
 */
export function getRandomObstacleSize(_pos: ObstaclePosition): ObstacleSize {
	const rand = Math.random();
	let sizeClass: ObstacleSizeClass;

	if (rand < SIZE_THRESHOLDS.small) {
		sizeClass = "KECIL";
	} else if (rand < SIZE_THRESHOLDS.medium) {
		sizeClass = "SEDANG";
	} else {
		sizeClass = "BESAR";
	}

	const config = OBSTACLE_SIZES[sizeClass];
	const height =
		Math.floor(Math.random() * config.heightRange) + config.heightMin;
	const width = Math.floor(Math.random() * config.widthRange) + config.widthMin;

	return { height, width, sizeClass };
}

/**
 * Hitung kecepatan obstacle berdasarkan skor dan mode kecepatan.
 * Naik 5% setiap 5 poin, maksimal 2.5x kecepatan dasar.
 */
export function calculateObstacleSpeed(
	score: number,
	simSpeedMultiplier: number,
): number {
	const scoreMultiplier =
		1 +
		Math.floor(score / OBSTACLE_CONFIG.speedScoreInterval) *
			OBSTACLE_CONFIG.speedIncrement;
	const clampedMultiplier = Math.min(
		scoreMultiplier,
		OBSTACLE_CONFIG.maxSpeedMultiplier,
	);
	return OBSTACLE_CONFIG.baseSpeed * clampedMultiplier * simSpeedMultiplier;
}

/**
 * Cek apakah shrimp bertabrakan dengan obstacle.
 */
export function checkCollision(
	playerY: number,
	obstacleX: number,
	obstacleWidth: number,
	obstacleHeight: number,
	obstaclePos: ObstaclePosition,
): boolean {
	const isXOverlap =
		SHRIMP_HITBOX.xPercent + SHRIMP_HITBOX.widthPercent > obstacleX &&
		SHRIMP_HITBOX.xPercent < obstacleX + (obstacleWidth / 400) * 100;

	if (!isXOverlap) return false;

	if (obstaclePos === "BOTTOM") {
		return playerY < obstacleHeight - 10;
	}

	const obsTopThreshold = 200 - obstacleHeight + 10;
	return playerY + SHRIMP_HITBOX.heightPx > obsTopThreshold;
}

/**
 * Baca high score dari localStorage. Kembalikan 0 jika tidak ada atau error.
 */
export function readHighScore(key: string): number {
	try {
		return parseInt(localStorage.getItem(key) ?? "0", 10);
	} catch {
		return 0;
	}
}

/**
 * Simpan high score ke localStorage. Abaikan error (mode private browsing dll).
 */
export function saveHighScore(key: string, score: number): void {
	try {
		localStorage.setItem(key, score.toString());
	} catch {
		// localStorage tidak tersedia, abaikan
	}
}
// Berdasarkan -> Berdasar kepada, Memeperoleh -> Memeroleh