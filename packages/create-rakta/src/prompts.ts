import * as clack from "@clack/prompts";
import type { BackendFramework, CssFramework, Database, ProjectConfig } from "./types";
import { BACKEND_DISPLAY, CSS_DISPLAY, DATABASE_DISPLAY } from "./types";

function exitOnCancel(value: unknown): void {
  if (clack.isCancel(value)) {
    clack.cancel("Setup cancelled. Run the command again when you are ready.");
    process.exit(0);
  }
}

export async function promptProjectName(fallback: string): Promise<string> {
  const answer = await clack.text({
    message: "Project name:",
    placeholder: fallback,
    defaultValue: fallback,
    validate(input) {
      const trimmed = input?.trim() ?? "";

      if (trimmed.length === 0) {
        return "Project name cannot be empty.";
      }

      if (!/^[a-z0-9-_]+$/i.test(trimmed)) {
        return "Use only letters, numbers, hyphens, and underscores.";
      }

      return undefined;
    }
  });

  exitOnCancel(answer);
  return String(answer).trim();
}

export async function promptCssFramework(): Promise<CssFramework> {
  const answer = await clack.select<CssFramework>({
    message: "Choose a CSS framework:",
    options: [
      {
        value: "tailwind",
        label: CSS_DISPLAY.tailwind,
        hint: "recommended"
      },
      {
        value: "bootstrap",
        label: CSS_DISPLAY.bootstrap
      },
      {
        value: "sass",
        label: CSS_DISPLAY.sass
      }
    ],
    initialValue: "tailwind"
  });

  exitOnCancel(answer);
  return answer as CssFramework;
}

export async function promptBackendFramework(): Promise<BackendFramework> {
  const answer = await clack.select<BackendFramework>({
    message: "Choose a backend framework:",
    options: [
      {
        value: "gaman",
        label: BACKEND_DISPLAY.gaman,
        hint: "recommended"
      },
      {
        value: "express",
        label: BACKEND_DISPLAY.express
      },
      {
        value: "nest",
        label: BACKEND_DISPLAY.nest
      },
      {
        value: "adonis",
        label: BACKEND_DISPLAY.adonis
      }
    ],
    initialValue: "gaman"
  });

  exitOnCancel(answer);
  return answer as BackendFramework;
}

export async function promptDatabase(): Promise<Database> {
  const answer = await clack.select<Database>({
    message: "Choose a database:",
    options: [
      {
        value: "postgresql",
        label: DATABASE_DISPLAY.postgresql,
        hint: "recommended"
      },
      {
        value: "mysql",
        label: DATABASE_DISPLAY.mysql
      },
      {
        value: "mongodb",
        label: DATABASE_DISPLAY.mongodb
      },
      {
        value: "firebase",
        label: DATABASE_DISPLAY.firebase
      },
      {
        value: "sqlite",
        label: DATABASE_DISPLAY.sqlite
      },
      {
        value: "mariadb",
        label: DATABASE_DISPLAY.mariadb
      },
      {
        value: "redis",
        label: DATABASE_DISPLAY.redis
      },
      {
        value: "planetscale",
        label: DATABASE_DISPLAY.planetscale
      },
      {
        value: "neon",
        label: DATABASE_DISPLAY.neon
      },
      {
        value: "turso",
        label: DATABASE_DISPLAY.turso
      }
    ],
    initialValue: "postgresql"
  });

  exitOnCancel(answer);
  return answer as Database;
}

export async function runPrompts(suggestedName: string): Promise<ProjectConfig> {
  const projectName = await promptProjectName(suggestedName);
  const cssFramework = await promptCssFramework();
  const backendFramework = await promptBackendFramework();
  const database = await promptDatabase();

  return {
    projectName,
    cssFramework,
    backendFramework,
    database
  };
}