export const STARTER_TYPES_CODE = `export interface SystemMetric {
  name: string;
  value: string | number;
  status: "nominal" | "warning" | "critical";
}

export interface GameHighScore {
  name: string;
  score: number;
  date: string;
}

export type AestheticUnit = "LENIS-MODERN" | "RETRO-CYBER" | "NEO-BRUTALIST";
`;

export const STARTER_AUDIO_CODE = `let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextCtor = window.AudioContext;
  if (!AudioContextCtor) return null;

  audioContext ??= new AudioContextCtor();
  return audioContext;
}

function playTone(frequency: number, durationMs: number, type: OscillatorType): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  gain.gain.setValueAtTime(0.045, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);
}

export function playJumpSound(): void {
  playTone(560, 90, "triangle");
}

export function playScoreSound(): void {
  playTone(880, 120, "square");
}
`;

export const STARTER_SHRIMP_CHARACTER_CODE = `interface ShrimpCharacterProps {
  status: "IDLE" | "SWIMMING" | "JUMPING" | "DEAD";
  playerY: number;
  rotation?: number;
}

export default function ShrimpCharacter({
  status,
  playerY,
  rotation,
}: ShrimpCharacterProps) {
  const isDead = status === "DEAD";
  const isSwimming = status === "SWIMMING";
  const finalRotation = rotation ?? (isDead ? 180 : status === "JUMPING" ? -10 : 0);
  const shrimpColor = isDead ? "fill-orange-400" : "fill-rose-500";

  return (
    <div
      className="relative flex h-16 w-16 select-none items-center justify-center transition-transform duration-75"
      style={{ transform: \`translateY(\${-playerY}px) rotate(\${finalRotation}deg)\` }}
    >
      <svg
        aria-label={isDead ? "Shrimp failed the run" : "Rakta shrimp runner"}
        role="img"
        viewBox="0 0 100 100"
        className={\`h-full w-full drop-shadow-[0_4px_12px_rgba(244,63,94,0.32)] \${isSwimming ? "animate-pulse" : ""}\`}
      >
        <path
          d="M 30 46 C 25 32, 45 22, 58 28 C 65 31, 62 48, 55 54 C 44 58, 35 55, 30 46 Z"
          className={shrimpColor}
        />
        <path
          d="M 55 30 C 65 24, 76 34, 74 46 C 72 54, 62 55, 55 48 Z"
          className={shrimpColor}
        />
        <path
          d="M 29 51 C 21 57, 16 61, 10 62"
          stroke={isDead ? "#fb923c" : "#f43f5e"}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 31 55 C 25 64, 22 70, 17 76"
          stroke={isDead ? "#fb923c" : "#f43f5e"}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="66" cy="38" r="4.5" fill={isDead ? "#18181b" : "#000"} />
        {!isDead && <circle cx="67.5" cy="36.5" r="1.2" fill="#fff" />}
        <path
          d="M 62 30 C 70 21, 82 19, 90 24"
          stroke="#fb7185"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 63 33 C 73 29, 84 31, 91 39"
          stroke="#fb7185"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
`;

export const STARTER_CORAL_OBSTACLE_CODE = `interface CoralObstacleProps {
  position: "TOP" | "BOTTOM";
  height: number;
  width?: number;
  paletteIndex?: number;
  variant?: number;
  scaleX?: number;
}

export default function CoralObstacle({
  position,
  height,
  width = 64,
  paletteIndex = 0,
  variant = 0,
  scaleX = 1,
}: CoralObstacleProps) {
  const fallbackPalette = {
    primary: "#f43f5e",
    secondary: "#fda4af",
    shadow: "#9f1239",
    polyps: "#ffe4e6",
    name: "rose",
  };
  const palettes = [
    fallbackPalette,
    { primary: "#06b6d4", secondary: "#67e8f9", shadow: "#155e75", polyps: "#ecfeff", name: "cyan" },
    { primary: "#a855f7", secondary: "#d8b4fe", shadow: "#581c87", polyps: "#faf5ff", name: "amethyst" },
    { primary: "#f59e0b", secondary: "#fde047", shadow: "#78350f", polyps: "#fefce8", name: "amber" },
    { primary: "#10b981", secondary: "#6ee7b7", shadow: "#065f46", polyps: "#e6fffa", name: "emerald" },
  ];

  const palette = palettes[paletteIndex % palettes.length] ?? fallbackPalette;
  const coralId = \`coralGrad-\${palette.name}-\${variant}\`;
  const flipped = position === "TOP" ? "scale(1, -1) translate(0, -120)" : undefined;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{ height: \`\${height}px\`, width: \`\${width}px\`, transform: \`scaleX(\${scaleX})\` }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 80 120"
        className="h-full w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={coralId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.secondary} />
            <stop offset="52%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.shadow} />
          </linearGradient>
          <filter id={\`coralGlow-\${variant}\`}>
            <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={flipped} filter={\`url(#coralGlow-\${variant})\`}>
          <path
            d="M 35 120 C 30 100, 15 90, 10 70 C 5 50, 20 40, 15 25 C 10 10, 25 5, 30 15 C 35 30, 28 45, 38 65 Q 42 90, 40 120"
            fill={palette.shadow}
            opacity="0.85"
          />
          <path
            d="M 45 120 C 50 105, 65 95, 70 75 C 75 55, 60 45, 65 30 C 70 15, 55 10, 50 20 C 45 35, 52 45, 42 65 Q 40 90, 45 120"
            fill={palette.shadow}
            opacity="0.85"
          />
          <path
            d="M 40 120 C 35 90, 20 80, 24 55 C 28 30, 15 20, 22 10 C 29 0, 37 15, 35 30 C 33 45, 42 55, 40 75 C 38 95, 42 110, 40 120 Z"
            fill={\`url(#\${coralId})\`}
          />
          <path
            d="M 40 120 C 45 95, 55 85, 52 65 C 49 45, 62 35, 58 20 C 54 5, 46 12, 48 25 C 50 38, 42 50, 44 70 C 46 90, 42 105, 40 120 Z"
            fill={\`url(#\${coralId})\`}
          />
          <circle cx="22" cy="11" r="3.5" fill={palette.polyps} />
          <circle cx="58" cy="21" r="3.5" fill={palette.polyps} />
          <circle cx="30" cy="15" r="2.5" fill={palette.secondary} />
          <circle cx="50" cy="20" r="2.5" fill={palette.secondary} />
        </g>
      </svg>
    </div>
  );
}
`;

export const STARTER_PAGE_CODE = `import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  LuActivity,
  LuCode,
  LuCpu,
  LuGauge,
  LuRocket,
  LuShieldCheck,
  LuZap,
} from "react-icons/lu";
import CoralObstacle from "./components/CoralObstacle";
import ShrimpCharacter from "./components/ShrimpCharacter";
import type { AestheticUnit } from "./types";
import { playJumpSound, playScoreSound } from "./utils/audio";

type GameStatus = "IDLE" | "SWIMMING" | "JUMPING" | "DEAD";
type SimSpeed = "NORMAL" | "FAST" | "TURBO";
type StatusCard = { title: string; text: string; Icon: IconType };
type FeatureCard = { number: string; title: string; text: string; Icon: IconType };

const GAME_WIDTH = 720;
const GAME_HEIGHT = 280;
const SHRIMP_X = 82;
const SHRIMP_SIZE = 58;
const GRAVITY = 0.82;
const JUMP_FORCE = 15;

function getSpeedValue(speed: SimSpeed): number {
  if (speed === "TURBO") return 8.2;
  if (speed === "FAST") return 6.4;
  return 5.2;
}

const statusCards: StatusCard[] = [
  { title: "Routing", text: "File-based routes with fast client navigation", Icon: LuZap },
  { title: "Metadata", text: "Default title, favicon, and SEO shell included", Icon: LuShieldCheck },
  { title: "Runtime", text: "Bun-powered dev server on localhost:3000", Icon: LuCpu },
];

const featureCards: FeatureCard[] = [
  { number: "01", title: "HOT RELOAD", text: "Pages, components, styles, layouts, stores, and route updates refresh immediately.", Icon: LuActivity },
  { number: "02", title: "REACT ICONS", text: "Starter icons use react-icons/lu only. No lucide-react dependency ships.", Icon: LuCode },
  { number: "03", title: "LOCAL FIRST", text: "The CLI prints and serves localhost:3000 for the frontend starter.", Icon: LuGauge },
];

export default function WelcomePage() {
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof localStorage === "undefined") return 0;
    return parseInt(localStorage.getItem("rakta_shrimprun_highscore") || "0", 10);
  });
  const [playerY, setPlayerY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [obstacleX, setObstacleX] = useState(GAME_WIDTH + 120);
  const [obstacleHeight, setObstacleHeight] = useState(84);
  const [obstacleWidth, setObstacleWidth] = useState(58);
  const [obstaclePalette, setObstaclePalette] = useState(0);
  const [obstacleVariant, setObstacleVariant] = useState(0);
  const [obstacleScaleX, setObstacleScaleX] = useState(1);
  const [aestheticUnit, setAestheticUnit] = useState<AestheticUnit>("LENIS-MODERN");
  const [simSpeed, setSimSpeed] = useState<SimSpeed>("NORMAL");
  const [lowLatencyMode, setLowLatencyMode] = useState(true);
  const [configToast, setConfigToast] = useState<string | null>(null);

  const statusRef = useRef(status);
  const velocityRef = useRef(0);
  const playerYRef = useRef(0);
  const obstacleXRef = useRef(GAME_WIDTH + 120);
  const scoreRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const showConfigToast = useCallback((message: string) => {
    setConfigToast(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setConfigToast(null), 1400);
  }, []);

  const resetObstacle = useCallback(() => {
    obstacleXRef.current = GAME_WIDTH + 80 + Math.random() * 220;
    setObstacleX(obstacleXRef.current);
    setObstacleHeight(58 + Math.floor(Math.random() * 82));
    setObstacleWidth(42 + Math.floor(Math.random() * 32));
    setObstaclePalette((value) => (value + 1) % 5);
    setObstacleVariant((value) => (value + 1) % 3);
    setObstacleScaleX(Math.random() > 0.5 ? 1 : -1);
  }, []);

  const startRun = useCallback(() => {
    if (statusRef.current === "DEAD") {
      scoreRef.current = 0;
      setScore(0);
      playerYRef.current = 0;
      velocityRef.current = 0;
      setPlayerY(0);
      resetObstacle();
    }

    statusRef.current = "SWIMMING";
    setStatus("SWIMMING");
  }, [resetObstacle]);

  const jump = useCallback(() => {
    if (statusRef.current === "IDLE" || statusRef.current === "DEAD") {
      startRun();
    }

    if (playerYRef.current <= 4) {
      velocityRef.current = JUMP_FORCE;
      setStatus("JUMPING");
      playJumpSound();
    }
  }, [startRun]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.code === "Space") {
        event.preventDefault();
        jump();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [jump]);

  useEffect(() => {
    function frame(timestamp: number): void {
      const delta = Math.min(timestamp - lastTimeRef.current, 32) / 16.67;
      lastTimeRef.current = timestamp;

      if (statusRef.current === "SWIMMING" || statusRef.current === "JUMPING") {
        velocityRef.current -= GRAVITY * delta;
        playerYRef.current = Math.max(0, playerYRef.current + velocityRef.current * delta);

        if (playerYRef.current === 0 && velocityRef.current < 0) {
          velocityRef.current = 0;
          setStatus("SWIMMING");
        }

        obstacleXRef.current -= getSpeedValue(simSpeed) * (lowLatencyMode ? 1.08 : 0.92) * delta;

        if (obstacleXRef.current < -90) {
          resetObstacle();
          scoreRef.current += 7;
          setScore(scoreRef.current);
          playScoreSound();
        }

        scoreRef.current += 1;
        setScore(scoreRef.current);

        const shrimpLeft = SHRIMP_X + 8;
        const shrimpRight = SHRIMP_X + SHRIMP_SIZE - 8;
        const shrimpBottom = GAME_HEIGHT - 54 - playerYRef.current;
        const shrimpTop = shrimpBottom - SHRIMP_SIZE + 12;
        const obstacleLeft = obstacleXRef.current + 8;
        const obstacleRight = obstacleXRef.current + obstacleWidth - 8;
        const obstacleTop = GAME_HEIGHT - 48 - obstacleHeight;
        const obstacleBottom = GAME_HEIGHT - 48;
        const didCollide =
          shrimpLeft < obstacleRight &&
          shrimpRight > obstacleLeft &&
          shrimpTop < obstacleBottom &&
          shrimpBottom > obstacleTop;

        if (didCollide) {
          statusRef.current = "DEAD";
          setStatus("DEAD");
          setRotation(180);
          const nextBest = Math.max(bestScore, scoreRef.current);
          setBestScore(nextBest);
          localStorage.setItem("rakta_shrimprun_highscore", String(nextBest));
        } else {
          setRotation(playerYRef.current > 0 ? -8 : 0);
        }

        setPlayerY(playerYRef.current);
        setObstacleX(obstacleXRef.current);
      }

      animationRef.current = requestAnimationFrame(frame);
    }

    animationRef.current = requestAnimationFrame(frame);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [bestScore, lowLatencyMode, obstacleHeight, obstacleWidth, resetObstacle, simSpeed]);

  const obstacleSizeClass =
    obstacleHeight < 82 ? "KECIL" : obstacleHeight < 120 ? "SEDANG" : "BESAR";
  const obstaclePos = "BOTTOM" as const;

  return (
    <div className="rakta-welcome min-h-screen bg-[#050505] text-white">
      <div className="scanline" />
      <main className="rakta-shell mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10">
        <nav className="rakta-nav flex items-center justify-between border-b border-surface-stroke pb-5">
          <div className="flex items-center gap-3 font-mono text-sm font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center border border-brand-pink bg-brand-pink text-black">
              R
            </span>
            Rakta.js
          </div>
          <div className="hidden items-center gap-6 font-mono text-[11px] font-bold uppercase tracking-wider text-[#b5b5b5] md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#shrimprun" className="transition hover:text-white">ShrimpRun</a>
            <a href="#start" className="transition hover:text-white">Start</a>
          </div>
        </nav>

        <section className="rakta-hero grid min-h-[540px] items-center gap-10 border-b border-surface-stroke py-12 md:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.32em] text-brand-pink">
              THE RED ROUTER FRAMEWORK
            </p>
            <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.88] tracking-normal text-white md:text-8xl">
              Small in size. Fierce in speed.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#b5b5b5] md:text-base">
              Rakta.js is ready. React, Bun, file routes, hot reload, metadata, favicon,
              and the ShrimpRun starter are already wired for your first route.
            </p>
            <div className="rakta-actions mt-8 flex flex-wrap gap-3">
              <a
                href="#shrimprun"
                className="inline-flex h-11 items-center gap-2 border border-brand-pink bg-brand-pink px-5 font-mono text-xs font-extrabold uppercase text-white transition hover:bg-white hover:text-black"
              >
                <LuRocket className="h-4 w-4" />
                Play ShrimpRun
              </a>
              <a
                href="#start"
                className="inline-flex h-11 items-center gap-2 border border-surface-stroke px-5 font-mono text-xs font-extrabold uppercase text-white transition hover:border-white"
              >
                <LuCode className="h-4 w-4" />
                Start Building
              </a>
            </div>
          </div>

          <div className="rakta-status-grid grid gap-3 border border-surface-stroke bg-surface-card p-5">
            {statusCards.map(({ title, text, Icon }) => (
              <div key={title} className="flex gap-4 border border-white/5 bg-black p-4">
                <Icon className="mt-1 h-5 w-5 text-brand-pink" />
                <div>
                  <h2 className="font-mono text-xs font-extrabold uppercase">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#b5b5b5]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="rakta-feature-grid grid grid-cols-1 gap-0 border border-surface-stroke md:grid-cols-3">
          {featureCards.map(({ number, title, text, Icon }) => (
            <div key={title} className="border-b border-surface-stroke p-7 md:border-b-0 md:border-r last:md:border-r-0">
              <span className="font-mono text-[10px] font-bold text-brand-pink">{number}</span>
              <Icon className="my-8 h-6 w-6 text-white" />
              <h2 className="font-mono text-xl font-extrabold uppercase">{title}</h2>
              <p className="mt-3 text-xs leading-6 text-[#b5b5b5]">{text}</p>
            </div>
          ))}
        </section>

        <section id="shrimprun" className="rakta-game-section grid gap-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-pink">
              SHRIMPRUN SIMULATION
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Avoid the coral.
            </h2>
          </div>

          <button
            type="button"
            onClick={jump}
            className="rakta-game-field relative h-[280px] overflow-hidden border-2 border-surface-stroke bg-black text-left outline-none transition focus-visible:border-brand-pink"
            aria-label="ShrimpRun game area. Press Space or click to jump."
          >
            <div className="bg-grid-glow absolute inset-0 opacity-80" />
            <div className="absolute inset-x-0 bottom-0 h-12 border-t border-cyan-400/20 bg-cyan-400/5" />
            <div className="seaweed-waving-left-1 absolute bottom-8 left-9 h-16 w-3 bg-emerald-500/70" />
            <div className="seaweed-waving-left-2 absolute bottom-8 left-16 h-24 w-3 bg-cyan-500/60" />
            <div className="seaweed-waving-right-1 absolute bottom-8 right-20 h-20 w-3 bg-emerald-500/70" />

            <div className="absolute left-6 top-5 z-20 flex gap-4 font-mono text-[11px] font-bold uppercase">
              <span>Score: {score}</span>
              <span className="text-brand-pink">Best: {bestScore}</span>
              <span>{status}</span>
            </div>

            <div
              className="absolute z-20"
              style={{ left: SHRIMP_X, bottom: 48 + playerY }}
            >
              <ShrimpCharacter status={status} playerY={0} rotation={rotation} />
            </div>

            <div className="absolute z-10" style={{ left: obstacleX, bottom: 48 }}>
              <CoralObstacle
                position={obstaclePos}
                height={obstacleHeight}
                width={obstacleWidth}
                paletteIndex={obstaclePalette}
                variant={obstacleVariant}
                scaleX={obstacleScaleX}
              />
            </div>

            {status === "IDLE" && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-black/55 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
                Press Space or click to start
              </div>
            )}
            {status === "DEAD" && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-black/75 text-center font-mono">
                <div>
                  <p className="text-3xl font-black text-brand-pink">SYSTEM IMPACT</p>
                  <p className="mt-2 text-xs uppercase text-[#b5b5b5]">Click to reboot the run</p>
                </div>
              </div>
            )}
          </button>

          <div className="rakta-game-controls flex flex-col justify-between gap-4 font-mono text-[10px] text-zinc-500 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-extrabold text-white">SHRIMPRUN {aestheticUnit.replace("-", " ")}</span>
              <span>CORAL:</span>
              <span className="border border-brand-pink/30 bg-brand-pink/5 px-2 py-0.5 font-bold text-brand-pink">
                {obstacleSizeClass}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(["LENIS-MODERN", "RETRO-CYBER", "NEO-BRUTALIST"] as AestheticUnit[]).map((unit) => (
                <button
                  type="button"
                  key={unit}
                  onClick={() => {
                    setAestheticUnit(unit);
                    showConfigToast(\`STYLE SET: \${unit}\`);
                    playScoreSound();
                  }}
                  className={\`px-2 py-1 font-bold transition \${aestheticUnit === unit ? "bg-white text-black" : "border border-surface-stroke text-zinc-500 hover:text-white"}\`}
                >
                  {unit}
                </button>
              ))}
              {(["NORMAL", "FAST", "TURBO"] as const).map((speed) => (
                <button
                  type="button"
                  key={speed}
                  onClick={() => {
                    setSimSpeed(speed);
                    showConfigToast(\`SPEED SET: \${speed}\`);
                    playScoreSound();
                  }}
                  className={\`px-2 py-1 font-bold transition \${simSpeed === speed ? "bg-brand-pink text-white" : "border border-surface-stroke text-zinc-500 hover:text-white"}\`}
                >
                  {speed}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLowLatencyMode((value) => !value);
                  showConfigToast(\`LATENCY MODE: \${!lowLatencyMode ? "LOW" : "STANDARD"}\`);
                  playJumpSound();
                }}
                className={\`px-2 py-1 font-bold transition \${lowLatencyMode ? "bg-cyan-400 text-black" : "border border-surface-stroke text-zinc-500"}\`}
              >
                LOW LATENCY {lowLatencyMode ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {configToast && (
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 border border-brand-pink bg-black px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-pink">
              {configToast}
            </div>
          )}
        </section>

        <section id="start" className="rakta-start border-t border-surface-stroke py-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-pink">
            NEXT MOVE
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">Edit app/page and ship.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b5b5b5]">
            This starter is intentionally immediate: no popups, no placeholder flow,
            and no hidden modal dependencies. Your first route is already alive.
          </p>
        </section>
      </main>
    </div>
  );
}
`;
