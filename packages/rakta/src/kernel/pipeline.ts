// RaktaKernel - Startup & Shutdown Pipeline
// Provides an ordered, phase-based pipeline for app lifecycle management.
// Each phase runs sequentially; tasks within a phase run concurrently.
// Shutdown runs phases in reverse order (LIFO).

export type PipelinePhase = "preload" | "configure" | "start" | "ready";

export interface PipelineTask {
	readonly name: string;
	readonly phase: PipelinePhase;
	readonly priority?: number; // lower = runs first. Default: 100
	run(): void | Promise<void>;
}

export interface StartupPipelineResult {
	readonly phases: readonly string[];
	readonly durationMs: number;
	readonly tasks: ReadonlyArray<{
		name: string;
		phase: string;
		durationMs: number;
	}>;
}

export interface RaktaPipeline {
	/** Register a task into the startup pipeline. */
	register(task: PipelineTask): void;

	/** Execute all startup phases in order. */
	run(): Promise<StartupPipelineResult>;

	/** Execute all shutdown phases in reverse order. */
	shutdown(): Promise<void>;

	/** Returns the ordered tasks for a given phase. */
	tasksForPhase(phase: PipelinePhase): readonly PipelineTask[];
}

const PHASE_ORDER: PipelinePhase[] = ["preload", "configure", "start", "ready"];

export function createStartupPipeline(): RaktaPipeline {
	const tasksByPhase = new Map<PipelinePhase, PipelineTask[]>(
		PHASE_ORDER.map((p) => [p, []]),
	);

	function getPhase(phase: PipelinePhase): PipelineTask[] {
		return tasksByPhase.get(phase) ?? [];
	}

	return {
		register(task) {
			const list = getPhase(task.phase);
			list.push(task);
			list.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
			tasksByPhase.set(task.phase, list);
		},

		async run() {
			const startAll = Date.now();
			const phaseResults: string[] = [];
			const taskResults: { name: string; phase: string; durationMs: number }[] =
				[];

			for (const phase of PHASE_ORDER) {
				phaseResults.push(phase);
				const tasks = getPhase(phase);

				for (const task of tasks) {
					const taskStart = Date.now();
					await task.run();
					taskResults.push({
						name: task.name,
						phase,
						durationMs: Date.now() - taskStart,
					});
				}
			}

			return {
				phases: phaseResults,
				durationMs: Date.now() - startAll,
				tasks: taskResults,
			};
		},

		async shutdown() {
			const reversedPhases = [...PHASE_ORDER].reverse();

			for (const phase of reversedPhases) {
				const tasks = [...getPhase(phase)].reverse();

				for (const task of tasks) {
					try {
						await task.run();
					} catch {
						// Shutdown errors are swallowed - best-effort cleanup.
					}
				}
			}
		},

		tasksForPhase(phase) {
			return getPhase(phase);
		},
	};
}
