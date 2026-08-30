#!/usr/bin/env bun
/**
 * Rakta.js Fullstack Development Orchestrator
 * Cross-platform process runner using Bun.spawn with stdout/stderr forwarding and [frontend]/[backend] prefixes.
 */
import { spawn } from "bun";

const isWindows = process.platform === "win32";

// Child process references for graceful cleanup
const children: ReturnType<typeof spawn>[] = [];

function cleanup() {
	for (const child of children) {
		try {
			if (isWindows) {
				spawn(["taskkill", "/pid", child.pid.toString(), "/T", "/F"], {
					stdout: "ignore",
					stderr: "ignore",
				});
			} else {
				child.kill("SIGTERM");
			}
		} catch {
			// Process might already be terminated
		}
	}
}

// Register termination handlers
process.on("SIGINT", () => {
	cleanup();
	process.exit(0);
});

process.on("SIGTERM", () => {
	cleanup();
	process.exit(0);
});

process.on("exit", () => {
	cleanup();
});

async function streamOutput(
	readable: ReadableStream<Uint8Array> | null,
	prefix: string,
	color: string,
	isError = false,
) {
	if (!readable) return;
	const reader = readable.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";
			for (const line of lines) {
				if (line.trim().length > 0 || line.length > 0) {
					const target = isError ? process.stderr : process.stdout;
					target.write(`${color}${prefix}\x1b[0m ${line}\n`);
				}
			}
		}
		if (buffer.length > 0) {
			const target = isError ? process.stderr : process.stdout;
			target.write(`${color}${prefix}\x1b[0m ${buffer}\n`);
		}
	} catch {
		// Stream closed
	}
}

async function start() {
	console.log(
		"\x1b[36m⩛ Starting Rakta.js Fullstack Development Server...\x1b[0m\n",
	);

	// Spawn frontend
	const frontendProc = spawn({
		cmd: isWindows
			? ["cmd.exe", "/c", "bun", "run", "dev"]
			: ["bun", "run", "dev"],
		cwd: "./frontend",
		env: { ...process.env, FORCE_COLOR: "1" },
		stdout: "pipe",
		stderr: "pipe",
	});
	children.push(frontendProc);

	// Spawn backend
	const backendProc = spawn({
		cmd: isWindows
			? ["cmd.exe", "/c", "bun", "run", "dev"]
			: ["bun", "run", "dev"],
		cwd: "./backend",
		env: { ...process.env, FORCE_COLOR: "1" },
		stdout: "pipe",
		stderr: "pipe",
	});
	children.push(backendProc);

	// Forward outputs with colored prefixes
	streamOutput(frontendProc.stdout, "[frontend]", "\x1b[35m", false);
	streamOutput(frontendProc.stderr, "[frontend]", "\x1b[31m", true);
	streamOutput(backendProc.stdout, "[backend]", "\x1b[34m", false);
	streamOutput(backendProc.stderr, "[backend]", "\x1b[31m", true);

	// Wait for any child to exit
	const exitCodes = await Promise.all([
		frontendProc.exited,
		backendProc.exited,
	]);
	cleanup();
	process.exit(exitCodes[0] !== 0 ? exitCodes[0] : exitCodes[1]);
}

start().catch((error) => {
	console.error("Failed to start fullstack services:", error);
	cleanup();
	process.exit(1);
});
