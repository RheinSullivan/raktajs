import {
	type ConsoleCommand,
	consoleCommands,
	defineCommand,
} from "./commands";

export type { ConsoleCommand };
export { consoleCommands, defineCommand };

export async function runConsoleCommand(name: string): Promise<boolean> {
	const command = consoleCommands.find((cmd) => cmd.name === name);
	if (!command) {
		console.error(`Command '${name}' not found.`);
		return false;
	}
	await command.run();
	return true;
}
