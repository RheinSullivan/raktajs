// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		// Lazy initialize to bypass browser autoplay policies until user interaction
		audioCtx = new window.AudioContext();
	}
	if (audioCtx.state === "suspended") {
		audioCtx.resume();
	}
	return audioCtx;
}

export function setMute(muted: boolean) {
	isMuted = muted;
}

export function getMuteState(): boolean {
	return isMuted;
}

export function playJumpSound() {
	if (isMuted) return;
	const ctx = getAudioContext();
	if (!ctx) return;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = "triangle";
	// Fast frequency sweep upwards
	osc.frequency.setValueAtTime(150, ctx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

	gain.gain.setValueAtTime(0.15, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start();
	osc.stop(ctx.currentTime + 0.16);
}

export function playScoreSound() {
	if (isMuted) return;
	const ctx = getAudioContext();
	if (!ctx) return;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = "square";

	// Clean double-beep chime
	osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
	osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5

	gain.gain.setValueAtTime(0.08, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start();
	osc.stop(ctx.currentTime + 0.22);
}

export function playGameOverSound() {
	if (isMuted) return;
	const ctx = getAudioContext();
	if (!ctx) return;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = "sawtooth";

	// Fast sliding pitch downwards
	osc.frequency.setValueAtTime(300, ctx.currentTime);
	osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.4);

	gain.gain.setValueAtTime(0.2, ctx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start();
	osc.stop(ctx.currentTime + 0.42);
}
