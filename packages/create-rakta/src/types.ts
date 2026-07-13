export type CssFramework = "tailwind" | "bootstrap" | "sass" | "none";

export type BackendFramework = "gaman" | "express" | "nest" | "adonis";

export type Database =
	| "postgresql"
	| "mysql"
	| "mongodb"
	| "firebase"
	| "sqlite"
	| "mariadb"
	| "redis"
	| "planetscale"
	| "neon"
	| "turso";

export type RenderMode = "csr" | "ssr" | "ssg" | "csg" | "spa" | "hybrid";

export type ProjectMode = "fullstack" | "frontend-only";

export type ProjectLanguage = "typescript" | "javascript";

export interface ProjectFile {
	readonly path: string;
	readonly content: string | Uint8Array;
}

export interface ProjectConfig {
	readonly projectName: string;
	readonly projectMode: ProjectMode;
	readonly language: ProjectLanguage;
	readonly useTypeScript: boolean;
	readonly cssFramework: CssFramework;
	readonly renderMode: RenderMode;
	readonly backendFramework: BackendFramework;
	readonly database: Database;
}

export const CSS_DISPLAY: Record<CssFramework, string> = {
	tailwind: "Tailwind CSS",
	bootstrap: "Bootstrap",
	sass: "SASS",
	none: "None",
};

export const BACKEND_DISPLAY: Record<BackendFramework, string> = {
	gaman: "Gaman.js",
	express: "Express.js",
	nest: "Nest.js",
	adonis: "Adonis.js",
};

export const DATABASE_DISPLAY: Record<Database, string> = {
	postgresql: "PostgreSQL",
	mysql: "MySQL",
	mongodb: "MongoDB",
	firebase: "Firebase",
	sqlite: "SQLite",
	mariadb: "MariaDB",
	redis: "Redis",
	planetscale: "PlanetScale",
	neon: "Neon",
	turso: "Turso",
};

export const RENDER_MODE_DISPLAY: Record<RenderMode, string> = {
	csr: "CSR — Client-Side Rendering",
	ssr: "SSR — Server-Side Rendering",
	ssg: "SSG — Static Site Generation",
	csg: "CSG — Configurable Static Generation",
	spa: "SPA — Single Page Application",
	hybrid: "Hybrid — Mixed per-route",
};

export const PROJECT_MODE_DISPLAY: Record<ProjectMode, string> = {
	fullstack: "Fullstack app (frontend + backend + database)",
	"frontend-only": "Frontend only (no backend, no database)",
};

export const PROJECT_LANGUAGE_DISPLAY: Record<ProjectLanguage, string> = {
	typescript: "TypeScript / TSX",
	javascript: "JavaScript / JSX",
};
