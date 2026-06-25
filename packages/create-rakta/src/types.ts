// CSS Framework
export type CssFramework = "tailwind" | "bootstrap" | "sass";
// Backend FrameWork
export type BackendFramework = "gaman" | "express" | "nest" | "adonis";
// Database Model
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

export interface ProjectFile {
    path: string;
    content: string;
};

export interface ProjectConfig {
    projectName: string;
    cssFramework: CssFramework;
    backendFramework: BackendFramework;
    database: Database
};

export const CSS_DISPLAY: Record<CssFramework, string> = {
    tailwind: "TailwindCSS",
    bootstrap: "Bootstrap",
    sass: "SASS"
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