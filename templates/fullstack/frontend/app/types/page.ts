export type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";
export type SimSpeed = "NORMAL" | "FAST" | "TURBO";
export type ObstaclePosition = "TOP" | "BOTTOM";
export type ObstacleSizeClass = "KECIL" | "SEDANG" | "BESAR";

export interface ObstacleSize {
	height: number;
	width: number;
	sizeClass: ObstacleSizeClass;
}

export interface HeaderProps {
	lang: "ID" | "EN";
	onLangToggle: () => void;
	isMuted: boolean;
	onMuteToggle: () => void;
	aestheticUnit: AestheticUnit;
	onAestheticChange: (unit: AestheticUnit) => void;
	lowLatencyMode: boolean;
	onLowLatencyToggle: () => void;
}

export interface HeroSectionProps {
	lang: "ID" | "EN";
	onOpenDocs: () => void;
	onOpenComponents: () => void;
	onOpenDeploy: () => void;
}

export interface ShrimpRunGameProps {
	isPlaying: boolean;
	score: number;
	highScore: number;
	hasCollision: boolean;
	liveFps: number;
	playerY: number;
	obstacleX: number;
	obstaclePos: ObstaclePosition;
	obstacleHeight: number;
	obstacleWidth: number;
	obstaclePalette: number;
	obstacleVariant: number;
	obstacleScaleX: number;
	obstacleSizeClass: ObstacleSizeClass;
	simSpeed: SimSpeed;
	onSpeedChange: (speed: SimSpeed) => void;
	onStartSimulation: () => void;
	onTriggerJump: () => void;
}
