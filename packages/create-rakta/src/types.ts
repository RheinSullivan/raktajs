export type CssFramework = "tailwind" | "bootstrap" | "sass" | "none";

export type BackendFramework =
	| "gaman"
	| "nestjs"
	| "express"
	| "adonis"
	| "hono"
	| "laravel"
	| "codeigniter"
	| "flask"
	| "django"
	| "prabogo"
	| "beego"
	| "rails"
	| "hanami"
	| "spring-boot"
	| "jakarta-ee";

export type Database =
	| "postgresql"
	| "mysql"
	| "sawitdb"
	| "oracle"
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

export type AuthStrategy = "none" | "jwt" | "session" | "jwt+session";

export type SessionPolicy =
	| "none"
	| "single-session"
	| "multiple-sessions"
	| "single-device"
	| "multiple-devices"
	| "revoke-previous"
	| "limit-active";

export type OAuthProvider =
	| "none"
	| "google"
	| "github"
	| "apple"
	| "microsoft"
	| "discord"
	| "gitlab"
	| "facebook"
	| "custom";

export interface ProjectFile {
	readonly path: string;
	readonly content: string | Uint8Array;
}

export interface ProjectConfig {
	readonly projectName: string;
	readonly projectMode: ProjectMode;
	readonly language: ProjectLanguage;
	readonly useTypeScript: boolean;
	readonly autoImport: boolean;
	readonly cssFramework: CssFramework;
	readonly renderMode: RenderMode;
	readonly backendFramework: BackendFramework;
	readonly database: Database;
	readonly authStrategy?: AuthStrategy;
	readonly sessionPolicy?: SessionPolicy;
	readonly oauthProviders?: readonly OAuthProvider[];
}

export const CSS_DISPLAY: Record<CssFramework, string> = {
	tailwind: "Tailwind CSS",
	bootstrap: "Bootstrap",
	sass: "SASS",
	none: "None",
};

export const BACKEND_DISPLAY: Record<BackendFramework, string> = {
	gaman: "Gaman.js (Default / Powered - JavaScript / TypeScript)",
	nestjs: "Nest.js (JavaScript / TypeScript)",
	express: "Express.js (JavaScript / TypeScript)",
	adonis: "Adonis.js (JavaScript / TypeScript)",
	hono: "Hono.js (JavaScript / TypeScript)",
	laravel: "Laravel (PHP)",
	codeigniter: "CodeIgniter (PHP)",
	flask: "Flask (Python)",
	django: "Django (Python)",
	prabogo: "Prabogo (Go)",
	beego: "Beego (Go)",
	rails: "Ruby on Rails (Ruby)",
	hanami: "Hanami (Ruby)",
	"spring-boot": "Spring Boot (Java)",
	"jakarta-ee": "Jakarta EE / J2EE (Java)",
};

export const DATABASE_DISPLAY: Record<Database, string> = {
	postgresql: "PostgreSQL",
	mysql: "MySQL",
	sawitdb: "SawitDB (Rakta Ecosystem Database Engine)",
	oracle: "Oracle Database",
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
	csr: "CSR - Client-Side Rendering",
	ssr: "SSR - Server-Side Rendering",
	ssg: "SSG - Static Site Generation",
	csg: "CSG - Configurable Static Generation",
	spa: "SPA - Single Page Application",
	hybrid: "Unified Rakta Rendering",
};

export const PROJECT_MODE_DISPLAY: Record<ProjectMode, string> = {
	fullstack: "Fullstack app (frontend + backend + database)",
	"frontend-only": "Frontend only (no backend, no database)",
};

export const PROJECT_LANGUAGE_DISPLAY: Record<ProjectLanguage, string> = {
	typescript: "TypeScript / TSX",
	javascript: "JavaScript / JSX",
};

export const AUTH_STRATEGY_DISPLAY: Record<AuthStrategy, string> = {
	none: "None",
	jwt: "JWT (stateless tokens)",
	session: "Session (server-side)",
	"jwt+session": "JWT + Session (hybrid)",
};

export const SESSION_POLICY_DISPLAY: Record<SessionPolicy, string> = {
	none: "None",
	"single-session": "Single session per user",
	"multiple-sessions": "Multiple sessions allowed",
	"single-device": "Single device only",
	"multiple-devices": "Multiple devices allowed",
	"revoke-previous": "Revoke previous login on new login",
	"limit-active": "Limit number of active sessions",
};

export const OAUTH_PROVIDER_DISPLAY: Record<OAuthProvider, string> = {
	none: "None",
	google: "Google",
	github: "GitHub",
	apple: "Apple",
	microsoft: "Microsoft",
	discord: "Discord",
	gitlab: "GitLab",
	facebook: "Facebook",
	custom: "Custom OAuth",
};
