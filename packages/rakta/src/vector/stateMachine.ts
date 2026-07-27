import { useCallback, useEffect, useRef, useState } from "react";
import type {
	MascotState,
	StateMachineConfig,
	TrusmiVectorConfig,
} from "./types";

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function emitMark(name: string): void {
	if (typeof performance !== "undefined") performance.mark(name);
}

/**
 * createStateMachine — type-safe state machine for SVG animation.
 * No proprietary file format — pure TypeScript.
 *
 * @example
 * const machine = createStateMachine({
 *   initial: "idle",
 *   states: [
 *     { name: "idle", loop: true, duration: 1000 },
 *     { name: "hover", loop: false, duration: 300 },
 *   ],
 *   transitions: [
 *     { from: "idle", to: "hover", on: "mouseenter" },
 *     { from: "hover", to: "idle", on: "mouseleave" },
 *   ],
 * });
 */
export function createStateMachine(config: StateMachineConfig): {
	current: string;
	send: (event: string, data?: unknown) => void;
	onTransition: (cb: (from: string, to: string) => void) => () => void;
} {
	let current = config.initial;
	const listeners = new Set<(from: string, to: string) => void>();

	const send = (event: string, data?: unknown): void => {
		const transition = config.transitions.find(
			(t) => t.from === current && t.on === event,
		);
		if (!transition) return;
		if (transition.guard && !transition.guard(data)) return;
		const from = current;
		current = transition.to;
		transition.action?.(data);
		emitMark(`rakta:vector-transition-${from}-${current}`);
		for (const cb of listeners) cb(from, current);
	};

	const onTransition = (
		cb: (from: string, to: string) => void,
	): (() => void) => {
		listeners.add(cb);
		return () => listeners.delete(cb);
	};

	return { current, send, onTransition };
}

/**
 * useTrusmiVector — React hook for SVG state machine animation.
 * Integrates with GSAP when available, uses CSS otherwise.
 */
export function useTrusmiVector(config: TrusmiVectorConfig): {
	state: string;
	send: (event: string, data?: unknown) => void;
} {
	const [state, setState] = useState(config.machine.initial);
	const machineRef = useRef(createStateMachine(config.machine));

	useEffect(() => {
		const machine = machineRef.current;
		const unsubscribe = machine.onTransition((_from, to) => {
			setState(to);
			const stateDef = config.machine.states.find((s) => s.name === to);
			if (!stateDef) return;
			if (prefersReducedMotion() && config.reducedMotion !== false) return;

			const target =
				typeof config.target === "string"
					? document.querySelector<SVGElement>(config.target)
					: config.target;
			if (!target) return;

			const gsap = (typeof globalThis !== "undefined" &&
				(globalThis as Record<string, unknown>).gsap) as
				| { to(t: unknown, v: unknown): void }
				| undefined;

			if (gsap && stateDef.gsapVars) {
				gsap.to(target, {
					duration: (stateDef.duration ?? 300) / 1000,
					...stateDef.gsapVars,
				});
			}
		});
		return unsubscribe;
	}, [config.machine, config.target, config.reducedMotion]);

	const send = useCallback((event: string, data?: unknown): void => {
		machineRef.current.send(event, data);
	}, []);

	return { state, send };
}

// Built-in Shrimp mascot states — matches ShrimpRun game states
export const SHRIMP_MASCOT_STATES: StateMachineConfig = {
	initial: "idle",
	states: [
		{
			name: "idle",
			loop: true,
			duration: 800,
			gsapVars: { scaleX: 1, scaleY: 1, rotation: 0 },
		},
		{
			name: "run",
			loop: true,
			duration: 300,
			gsapVars: { scaleX: 1.05, scaleY: 0.95 },
		},
		{
			name: "jump",
			loop: false,
			duration: 200,
			gsapVars: { scaleX: 0.9, scaleY: 1.1, y: -10 },
		},
		{
			name: "fall",
			loop: false,
			duration: 200,
			gsapVars: { scaleX: 1.1, scaleY: 0.9, y: 10 },
		},
		{
			name: "hurt",
			loop: false,
			duration: 400,
			gsapVars: { opacity: 0.5, x: -5 },
		},
		{
			name: "celebrate",
			loop: true,
			duration: 500,
			gsapVars: { rotation: 10, yoyo: true, repeat: -1 },
		},
		{
			name: "dead",
			loop: false,
			duration: 600,
			gsapVars: { rotation: 90, opacity: 0, y: 20 },
		},
	],
	transitions: [
		{ from: "idle", to: "run", on: "start" },
		{ from: "run", to: "jump", on: "jump" },
		{ from: "jump", to: "fall", on: "peak" },
		{ from: "fall", to: "run", on: "land" },
		{ from: "run", to: "hurt", on: "hurt" },
		{ from: "hurt", to: "run", on: "recover" },
		{ from: "run", to: "dead", on: "die" },
		{ from: "hurt", to: "dead", on: "die" },
		{ from: "run", to: "celebrate", on: "score" },
		{ from: "celebrate", to: "run", on: "resume" },
		{ from: "run", to: "idle", on: "stop" },
		{ from: "dead", to: "idle", on: "reset" },
	],
};

/**
 * useMascot — typed hook for Rakta.js shrimp mascot state machine.
 * Pre-wired with SHRIMP_MASCOT_STATES.
 */
export function useMascot(target: string | SVGElement): {
	state: MascotState;
	send: (event: string) => void;
} {
	const { state, send } = useTrusmiVector({
		target,
		machine: SHRIMP_MASCOT_STATES,
		reducedMotion: true,
	});

	return { state: state as MascotState, send };
}
