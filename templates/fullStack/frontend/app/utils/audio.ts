// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
let sharedAudioContext: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	const AudioCtx =
		window.AudioContext ||
		(window as unknown as { webkitAudioContext?: typeof AudioContext })
			.webkitAudioContext;
	if (!AudioCtx) return null;
	if (!sharedAudioContext) {
		// Lazy initialize to bypass browser autoplay policies until user interaction
		sharedAudioContext = new AudioCtx();
	}
	if (sharedAudioContext.state === "suspended") {
		sharedAudioContext.resume().catch(() => {});
	}
	return sharedAudioContext;
}

export function setMute(muted: boolean) {
	isMuted = muted;
}

export function getMuteState(): boolean {
	return isMuted;
}

export function playJumpSound() {
	if (isMuted) return;
	const audioContext = getAudioContext();
	if (!audioContext) return;

	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.type = "triangle";
	// Fast frequency sweep upwards
	oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
	oscillator.frequency.exponentialRampToValueAtTime(
		600,
		audioContext.currentTime + 0.15,
	);

	gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(
		0.01,
		audioContext.currentTime + 0.15,
	);

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.start();
	oscillator.stop(audioContext.currentTime + 0.16);
}

export function playScoreSound() {
	if (isMuted) return;
	const audioContext = getAudioContext();
	if (!audioContext) return;

	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.type = "square";

	// Clean double-beep chime
	oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
	oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.08); // E5

	gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(
		0.01,
		audioContext.currentTime + 0.2,
	);

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.start();
	oscillator.stop(audioContext.currentTime + 0.22);
}

export function playGameOverSound() {
	if (isMuted) return;
	const audioContext = getAudioContext();
	if (!audioContext) return;

	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.type = "sawtooth";

	// Fast sliding pitch downwards
	oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
	oscillator.frequency.linearRampToValueAtTime(
		40,
		audioContext.currentTime + 0.4,
	);

	gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(
		0.01,
		audioContext.currentTime + 0.4,
	);

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.start();
	oscillator.stop(audioContext.currentTime + 0.42);
}
