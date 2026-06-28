import * as clack from "@clack/prompts";
import type {
  BackendFramework,
  CssFramework,
  Database,
  ProjectConfig,
  ProjectMode,
  RenderMode,
} from "./types";
import {
  BACKEND_DISPLAY,
  CSS_DISPLAY,
  DATABASE_DISPLAY,
  PROJECT_MODE_DISPLAY,
  RENDER_MODE_DISPLAY,
} from "./types";

function getPromptValue<TValue>(
  value: TValue | symbol
): TValue {
  if (clack.isCancel(value)) {
    clack.cancel("Setup cancelled.");
    process.exit(0);
  }

  return value;
}

export async function promptProjectName(
  fallback: string
): Promise<string> {
  const answer = await clack.text({
    message: "Project name:",
    placeholder: fallback,
    defaultValue: fallback,
    validate(input) {
      const trimmed = (input ?? "").trim();

      if (trimmed.length === 0) {
        return "Project name cannot be empty.";
      }

      if (!/^[a-z0-9-_]+$/i.test(trimmed)) {
        return "Use only letters, numbers, hyphens, and underscores.";
      }

      return undefined;
    },
  });

  return getPromptValue(answer).trim();
}

export async function promptProjectMode(): Promise<ProjectMode> {
  const answer = await clack.select<ProjectMode>({
    message: "What do you want to create?",
    options: [
      {
        value: "fullstack",
        label: PROJECT_MODE_DISPLAY.fullstack,
      },
      {
        value: "frontend-only",
        label: PROJECT_MODE_DISPLAY["frontend-only"],
      },
    ],
    initialValue: "frontend-only",
  });

  return getPromptValue(answer);
}

export async function promptCssFramework(): Promise<CssFramework> {
  const answer = await clack.select<CssFramework>({
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

  return getPromptValue(answer);
}

export async function promptRenderMode(): Promise<RenderMode> {
  const answer = await clack.select<RenderMode>({
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

  return getPromptValue(answer);
}

export async function promptBackendFramework(): Promise<BackendFramework> {
  const answer = await clack.select<BackendFramework>({
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

  return getPromptValue(answer);
}

export async function promptDatabase(): Promise<Database> {
  const answer = await clack.select<Database>({
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

  return getPromptValue(answer);
}

export async function runPrompts(
  suggestedName: string
): Promise<ProjectConfig> {
  const projectName = await promptProjectName(suggestedName);
  const projectMode = await promptProjectMode();
  const cssFramework = await promptCssFramework();
  const renderMode = await promptRenderMode();

  if (projectMode === "frontend-only") {
    return {
      projectName,
      projectMode,
      cssFramework,
      renderMode,
      backendFramework: "gaman",
      database: "postgresql",
    };
  }

  const backendFramework = await promptBackendFramework();
  const database = await promptDatabase();

  return {
    projectName,
    projectMode,
    cssFramework,
    renderMode,
    backendFramework,
    database,
  };
}