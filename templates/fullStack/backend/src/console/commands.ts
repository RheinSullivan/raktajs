export interface ConsoleCommand {
	readonly name: string;
	readonly description: string;
	run(): Promise<void> | void;
}

export function defineCommand(command: ConsoleCommand): ConsoleCommand {
	return command;
}

export const consoleCommands: readonly ConsoleCommand[] = [
	defineCommand({
		name: "health",
		description: "Print backend health information.",
		run() {
			console.log("Rakta backend is ready.");
		},
	}),
];
