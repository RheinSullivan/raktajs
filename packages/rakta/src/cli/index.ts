// CherbonsEngine CLI - re-exported for programmatic use
export { buildCommand } from "./build";
export type {
	AnalyzeReport,
	BenchmarkResult,
	CheckResult,
	DoctorCheck,
	DoctorReport,
	GenerateOptions,
	GenerateResult,
	GenerateTarget,
	InspectReport,
	TelemetryConfig,
} from "./commands";
export {
	analyzeCommand,
	benchmarkCommand,
	checkCommand,
	doctorCommand,
	generateCommand,
	inspectCommand,
	readTelemetryConfig,
	setTelemetryEnabled,
} from "./commands";
export { startCommand } from "./start";
