import type { BackendFramework, ProjectConfig, ProjectFile } from "../types";
import { adonisAdapter } from "./adonisAdapter";
import type { BackendAdapter } from "./backendAdapter";
import { beegoAdapter } from "./beegoAdapter";
import { codeigniterAdapter } from "./codeigniterAdapter";
import { djangoAdapter } from "./djangoAdapter";
import { expressAdapter } from "./expressAdapter";
import { flaskAdapter } from "./flaskAdapter";
import { gamanAdapter } from "./gamanAdapter";
import { hanamiAdapter } from "./hanamiAdapter";
import { honoAdapter } from "./honoAdapter";
import { jakartaEeAdapter } from "./jakartaEeAdapter";
import { laravelAdapter } from "./laravelAdapter";
import { nestjsAdapter } from "./nestjsAdapter";
import { prabogoAdapter } from "./prabogoAdapter";
import { railsAdapter } from "./railsAdapter";
import { springBootAdapter } from "./springBootAdapter";

export const backendAdapters: Record<BackendFramework, BackendAdapter> = {
	gaman: gamanAdapter,
	nestjs: nestjsAdapter,
	express: expressAdapter,
	adonis: adonisAdapter,
	hono: honoAdapter,
	laravel: laravelAdapter,
	codeigniter: codeigniterAdapter,
	flask: flaskAdapter,
	django: djangoAdapter,
	prabogo: prabogoAdapter,
	beego: beegoAdapter,
	rails: railsAdapter,
	hanami: hanamiAdapter,
	"spring-boot": springBootAdapter,
	"jakarta-ee": jakartaEeAdapter,
};

export function generateBackendFiles(
	projectConfiguration: ProjectConfig,
): ProjectFile[] {
	const selectedBackendIdentifier =
		projectConfiguration.backendFramework || "gaman";
	const selectedAdapter =
		backendAdapters[selectedBackendIdentifier] ?? gamanAdapter;

	return selectedAdapter.generateFiles(projectConfiguration);
}
