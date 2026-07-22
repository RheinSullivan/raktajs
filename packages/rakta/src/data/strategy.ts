import type { RaktaRouteDataStrategy } from "./types";

export function defineRouteDataStrategy(
	strategy: RaktaRouteDataStrategy,
): RaktaRouteDataStrategy {
	return strategy;
}

export function shouldPrefetchRoute(strategy: RaktaRouteDataStrategy): boolean {
	return strategy.prefetch && strategy.runtime !== "static";
}

export function shouldStreamRoute(strategy: RaktaRouteDataStrategy): boolean {
	return strategy.stream && strategy.runtime !== "client";
}

export function isIncrementalRoute(strategy: RaktaRouteDataStrategy): boolean {
	return strategy.revalidate !== undefined && strategy.revalidate > 0;
}
