declare module "gaman" {
	export interface HTTP {
		readonly protocol: "http";
	}

	export interface GamanContext {
		readonly req?: Request;
		readonly request?: Request;
		readonly url?: string;
		readonly path?: string;
		readonly method?: string;
		json(): Promise<unknown>;
		send(data: unknown): unknown;
		status(code: number): GamanContext;
		setHeader(key: string, value: string): GamanContext;
	}

	export interface GamanApp {
		get(path: string, handler: (context: GamanContext) => unknown): void;
		post(path: string, handler: (context: GamanContext) => unknown): void;
		patch(path: string, handler: (context: GamanContext) => unknown): void;
		delete(path: string, handler: (context: GamanContext) => unknown): void;
		options(path: string, handler: (context: GamanContext) => unknown): void;
		mountServer(options: { readonly http: number }): void;
	}

	export function Gaman<TTransport>(): GamanApp;
}
