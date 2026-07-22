export type RaktaTestKind =
	| "unit"
	| "integration"
	| "component"
	| "e2e"
	| "snapshot";

export interface RaktaTestCase {
	readonly name: string;
	readonly kind: RaktaTestKind;
	run(): Promise<void> | void;
}

export interface RaktaTestResult {
	readonly name: string;
	readonly kind: RaktaTestKind;
	readonly passed: boolean;
	readonly duration: number;
	readonly error?: string;
}

export interface RaktaCoverageReport {
	readonly files: number;
	readonly covered: number;
	readonly percent: number;
}

export interface RaktaMockRoute {
	readonly method: string;
	readonly pathname: string;
	readonly response: Response;
}
