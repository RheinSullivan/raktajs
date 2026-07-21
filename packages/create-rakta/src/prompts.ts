import * as clack from "@clack/prompts";
import type {
	BackendFramework,
	CssFramework,
	Database,
	ProjectConfig,
	ProjectLanguage,
	ProjectMode,
	RenderMode,
} from "./types";
import {
	BACKEND_DISPLAY,
	CSS_DISPLAY,
	DATABASE_DISPLAY,
	PROJECT_LANGUAGE_DISPLAY,
	PROJECT_MODE_DISPLAY,
	RENDER_MODE_DISPLAY,
} from "./types";

function getPromptValue<TValue>(promptResult: TValue | symbol): TValue {
	if (clack.isCancel(promptResult)) {
		clack.cancel("Setup cancelled.");
		process.exit(0);
	}

	return promptResult;
}

export async function promptProjectName(fallbackName: string): Promise<string> {
	const promptResult = await clack.text({
		message: "Project name:",
		placeholder: fallbackName,
		defaultValue: fallbackName,
		validate(inputValue) {
			const trimmedInput = (inputValue ?? "").trim();

			if (trimmedInput.length === 0) {
				return "Project name cannot be empty.";
			}

			if (!/^[a-z0-9-_]+$/i.test(trimmedInput)) {
				return "Use only letters, numbers, hyphens, and underscores.";
			}

			return undefined;
		},
	});

	return getPromptValue(promptResult).trim();
}

export async function promptProjectMode(): Promise<ProjectMode> {
	const promptResult = await clack.select<ProjectMode>({
		message: "What do you want to create?",
		options: [
			{
				value: "frontend-only",
				label: PROJECT_MODE_DISPLAY["frontend-only"],
				hint: "recommended for starters",
			},
			{
				value: "fullstack",
				label: PROJECT_MODE_DISPLAY.fullstack,
			},
		],
		initialValue: "frontend-only",
	});

	return getPromptValue(promptResult);
}

export async function promptCssFramework(): Promise<CssFramework> {
	const promptResult = await clack.select<CssFramework>({
		message: "Choose a CSS framework:",
		options: [
			{
				value: "tailwind",
				label: CSS_DISPLAY.tailwind,
				hint: "recommended",
			},
			{
				value: "bootstrap",
				label: CSS_DISPLAY.bootstrap,
			},
			{
				value: "sass",
				label: CSS_DISPLAY.sass,
			},
			{
				value: "none",
				label: CSS_DISPLAY.none,
			},
		],
		initialValue: "tailwind",
	});

	return getPromptValue(promptResult);
}

export async function promptProjectLanguage(): Promise<ProjectLanguage> {
	const promptResult = await clack.select<ProjectLanguage>({
		message: "Choose a language:",
		options: [
			{
				value: "typescript",
				label: PROJECT_LANGUAGE_DISPLAY.typescript,
				hint: "recommended",
			},
			{
				value: "javascript",
				label: PROJECT_LANGUAGE_DISPLAY.javascript,
			},
		],
		initialValue: "typescript",
	});

	return getPromptValue(promptResult);
}

export async function promptRenderMode(): Promise<RenderMode> {
	const promptResult = await clack.select<RenderMode>({
		message: "Choose a render mode:",
		options: [
			{
				value: "csr",
				label: RENDER_MODE_DISPLAY.csr,
				hint: "recommended",
			},
			{
				value: "spa",
				label: RENDER_MODE_DISPLAY.spa,
			},
			{
				value: "hybrid",
				label: RENDER_MODE_DISPLAY.hybrid,
			},
			{
				value: "ssr",
				label: RENDER_MODE_DISPLAY.ssr,
			},
			{
				value: "ssg",
				label: RENDER_MODE_DISPLAY.ssg,
			},
			{
				value: "csg",
				label: RENDER_MODE_DISPLAY.csg,
			},
		],
		initialValue: "csr",
	});

	return getPromptValue(promptResult);
}

export async function promptAutoImport(): Promise<boolean> {
	const promptResult = await clack.confirm({
		message: "Use Rakta.js Auto Import?",
		initialValue: true,
	});

	return getPromptValue(promptResult);
}

export async function promptBackendFramework(): Promise<BackendFramework> {
	const promptResult = await clack.select<BackendFramework>({
		message: "Choose a backend framework:",
		options: [
			{
				value: "gaman",
				label: BACKEND_DISPLAY.gaman,
				hint: "recommended",
			},
			{
				value: "express",
				label: BACKEND_DISPLAY.express,
			},
			{
				value: "nest",
				label: BACKEND_DISPLAY.nest,
			},
			{
				value: "adonis",
				label: BACKEND_DISPLAY.adonis,
			},
		],
		initialValue: "gaman",
	});

	return getPromptValue(promptResult);
}

export async function promptDatabase(): Promise<Database> {
	const promptResult = await clack.select<Database>({
		message: "Choose a database:",
		options: [
			{
				value: "postgresql",
				label: DATABASE_DISPLAY.postgresql,
				hint: "recommended",
			},
			{
				value: "mysql",
				label: DATABASE_DISPLAY.mysql,
			},
			{
				value: "mongodb",
				label: DATABASE_DISPLAY.mongodb,
			},
			{
				value: "firebase",
				label: DATABASE_DISPLAY.firebase,
			},
			{
				value: "sqlite",
				label: DATABASE_DISPLAY.sqlite,
			},
			{
				value: "mariadb",
				label: DATABASE_DISPLAY.mariadb,
			},
			{
				value: "redis",
				label: DATABASE_DISPLAY.redis,
			},
			{
				value: "planetscale",
				label: DATABASE_DISPLAY.planetscale,
			},
			{
				value: "neon",
				label: DATABASE_DISPLAY.neon,
			},
			{
				value: "turso",
				label: DATABASE_DISPLAY.turso,
			},
		],
		initialValue: "postgresql",
	});

	return getPromptValue(promptResult);
}

export async function runPrompts(projectName: string): Promise<ProjectConfig> {
	const projectMode = await promptProjectMode();
	const language = await promptProjectLanguage();
	const cssFramework = await promptCssFramework();
	const renderMode = await promptRenderMode();
	const autoImport = await promptAutoImport();
	const useTypeScript = language === "typescript";

	if (projectMode === "frontend-only") {
		return {
			projectName,
			projectMode,
			language,
			useTypeScript,
			autoImport,
			cssFramework,
			renderMode,
			backendFramework: "gaman",
			database: "postgresql",
		};
	}

	const backendFramework = await promptBackendFramework();
	const selectedDatabase = await promptDatabase();

	return {
		projectName,
		projectMode,
		language,
		useTypeScript,
		autoImport,
		cssFramework,
		renderMode,
		backendFramework,
		database: selectedDatabase,
	};
}
