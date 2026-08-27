// Data konfigurasi ikan latar belakang untuk ShrimpRun
// Dipisah dari BackgroundFish.tsx supaya component hanya bertugas render.

export interface Fish {
	id: number;
	size: "small" | "medium";
	/** Berapa detik ikan melintasi layar penuh */
	speed: number;
	/** Posisi vertikal, dalam persen dari atas */
	startY: number;
	/** Jeda sebelum animasi dimulai, dalam detik */
	delay: number;
	/** Arah renang */
	direction: "left" | "right";
}

export const FISH_CONFIG: Fish[] = [
	{ id: 1, size: "small", speed: 12, startY: 20, delay: 0, direction: "right" },
	{ id: 2, size: "medium", speed: 18, startY: 50, delay: 4, direction: "left" },
	{ id: 3, size: "small", speed: 15, startY: 75, delay: 8, direction: "right" },
] as const;
