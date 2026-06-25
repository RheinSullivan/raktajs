export type RaktaRenderMode =
  | "csr"
  | "ssr"
  | "ssg"
  | "csg"
  | "spa"
  | "hybrid";

export type RaktaRouteRenderMap = Record<string, RaktaRenderMode>;

export interface RaktaRenderConfig {
  defaultMode?: RaktaRenderMode;
  routes?: RaktaRouteRenderMap;
}

export interface RaktaConfig {
  appName?: string;
  render?: RaktaRenderConfig;
}

export function defineRaktaConfig(config: RaktaConfig): RaktaConfig {
  return config;
}

export const RAKTA_NAME = "Rakta.js";
export const RAKTA_VERSION = "0.1.0";
export const RAKTA_TAGLINE =
  "Small in size. Fierce in speed. Alive in every route.";