import { join } from "node:path";
import { loadConfig } from "../config/load-config.js";
import { createBunAdapter } from "../tide/adapter.js";

export async function startCommand(
    cwd: string = process.cwd()
): Promise<void> {
    const config = await loadConfig(cwd);
    const outputDirectory = config.build.outDir ?? "dist";

    console.log("\n Starting Rakta.js production server...\n");

    const adapter = createBunAdapter(
        {
            kind: "bun",
            port: config.port,
            host: config.server.hostname ?? "0.0.0.0",
            appName: config.appName,
            appDir: join(cwd, config.appDir),
            publicDir: join(cwd, config.publicDir),
            outDir: join(cwd, outputDirectory),
        },
        config.render
    );

    await adapter.start();
};