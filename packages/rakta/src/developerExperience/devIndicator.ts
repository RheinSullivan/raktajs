export type RaktaDevToolsTheme = "system" | "light" | "dark";
export type RaktaDevToolsPosition =
	| "bottom-left"
	| "bottom-right"
	| "top-left"
	| "top-right";
export type RaktaDevToolsSize = "small" | "medium" | "large";
export type RaktaDevToolsPanelView = "main" | "route-info" | "preferences";

export interface RaktaDevToolsPreferences {
	readonly theme: RaktaDevToolsTheme;
	readonly position: RaktaDevToolsPosition;
	readonly size: RaktaDevToolsSize;
	readonly shortcut: string | null;
}

export interface RaktaDevToolsRouteSegment {
	readonly raw: string;
	readonly pathPart: string;
	readonly isDynamic: boolean;
	readonly isCatchAll: boolean;
	readonly isOptionalCatchAll: boolean;
	readonly isGroup: boolean;
	readonly paramName: string;
}

export interface RaktaDevToolsRouteInfo {
	readonly currentPathname: string;
	readonly matchedPattern: string | null;
	readonly routeType: string;
	readonly renderMode: string;
	readonly renderModeSource: string;
	readonly routeSource: string | null;
	readonly layoutFiles: ReadonlyArray<string>;
	readonly pageFile: string | null;
	readonly segments: ReadonlyArray<RaktaDevToolsRouteSegment>;
	readonly isDynamic: boolean;
	readonly paramNames: ReadonlyArray<string>;
	readonly manifestGeneratedAt: string;
}

export interface RaktaDevToolsCommandResult {
	readonly ok: boolean;
	readonly message: string;
}

export interface DevIndicatorOptions {
	readonly version: string;
	readonly routePath?: string;
	readonly renderMode?: string;
	readonly bundler?: string;
	readonly logoDataUrl: string;
	readonly routeInfo?: RaktaDevToolsRouteInfo;
	readonly controlBasePath?: string;
}

interface RaktaDevToolsState {
	isOpen: boolean;
	panelView: RaktaDevToolsPanelView;
	preferences: RaktaDevToolsPreferences;
	routeInfo: RaktaDevToolsRouteInfo;
	activeCommand: "restart" | "cache-reset" | null;
	commandMessage: string;
}

const FEATURE_NAME = "Rakta DevTools";
const CONTROL_BASE_PATH = "/__rakta/devtools";
const PREFERENCES_STORAGE_KEY = "rakta:devtools:preferences";
const SESSION_HIDDEN_STORAGE_KEY = "rakta:devtools:hidden-session";
const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const DEFAULT_RAKTA_DEVTOOLS_PREFERENCES: RaktaDevToolsPreferences = {
	theme: "system",
	position: "bottom-left",
	size: "medium",
	shortcut: "Alt+Shift+D",
};

const POSITION_LABELS: Readonly<Record<RaktaDevToolsPosition, string>> = {
	"bottom-left": "Bottom Left",
	"bottom-right": "Bottom Right",
	"top-left": "Top Left",
	"top-right": "Top Right",
};

const THEME_LABELS: Readonly<Record<RaktaDevToolsTheme, string>> = {
	system: "System",
	light: "Light",
	dark: "Dark",
};

const SIZE_LABELS: Readonly<Record<RaktaDevToolsSize, string>> = {
	small: "Small",
	medium: "Medium",
	large: "Large",
};

const RESERVED_SHORTCUTS = new Set([
	"Alt+ArrowLeft",
	"Alt+ArrowRight",
	"Alt+F4",
	"Control+L",
	"Control+N",
	"Control+R",
	"Control+S",
	"Control+T",
	"Control+W",
	"Meta+L",
	"Meta+N",
	"Meta+R",
	"Meta+S",
	"Meta+T",
	"Meta+W",
]);

const CSS = `
[data-rakta-devtools] {
  all: initial;
  color-scheme: light dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.35;
  --rakta-devtools-edge: 18px;
  --rakta-devtools-button-size: 38px;
  --rakta-devtools-logo-size: 24px;
  --rakta-devtools-panel-width: min(340px, calc(100vw - 24px));
  --rakta-devtools-background: #101113;
  --rakta-devtools-surface: #17181b;
  --rakta-devtools-muted-surface: #202126;
  --rakta-devtools-text: #f5f5f6;
  --rakta-devtools-muted: #a5a7ad;
  --rakta-devtools-subtle: #747780;
  --rakta-devtools-border: #303239;
  --rakta-devtools-accent: #c60005;
  --rakta-devtools-accent-soft: rgba(198, 0, 5, 0.18);
  --rakta-devtools-shadow: 0 18px 55px rgba(0, 0, 0, 0.42);
  box-sizing: border-box;
}
[data-rakta-devtools][data-theme="light"] {
  --rakta-devtools-background: #ffffff;
  --rakta-devtools-surface: #f7f7f8;
  --rakta-devtools-muted-surface: #eceef1;
  --rakta-devtools-text: #161719;
  --rakta-devtools-muted: #4d5159;
  --rakta-devtools-subtle: #737984;
  --rakta-devtools-border: #d9dde3;
  --rakta-devtools-shadow: 0 18px 55px rgba(16, 24, 40, 0.16);
}
[data-rakta-devtools] * {
  box-sizing: border-box;
  font: inherit;
}
[data-rakta-devtools][data-size="small"] {
  --rakta-devtools-button-size: 32px;
  --rakta-devtools-logo-size: 20px;
  --rakta-devtools-panel-width: min(310px, calc(100vw - 24px));
}
[data-rakta-devtools][data-size="large"] {
  --rakta-devtools-button-size: 46px;
  --rakta-devtools-logo-size: 29px;
  --rakta-devtools-panel-width: min(380px, calc(100vw - 24px));
}
.rakta-devtools-indicator {
  position: fixed;
  z-index: 2147483647;
  width: var(--rakta-devtools-button-size);
  height: var(--rakta-devtools-button-size);
  border-radius: 999px;
  border: 1px solid var(--rakta-devtools-border);
  background: var(--rakta-devtools-background);
  color: var(--rakta-devtools-text);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
  display: grid;
  place-items: center;
  padding: 5px;
  cursor: pointer;
  outline: none;
}
.rakta-devtools-indicator:hover {
  border-color: var(--rakta-devtools-accent);
}
.rakta-devtools-indicator:focus-visible,
.rakta-devtools-button:focus-visible,
.rakta-devtools-select:focus-visible,
.rakta-devtools-shortcut-input:focus-visible {
  outline: 3px solid var(--rakta-devtools-accent-soft);
  outline-offset: 2px;
  border-color: var(--rakta-devtools-accent);
}
.rakta-devtools-logo {
  width: var(--rakta-devtools-logo-size);
  height: var(--rakta-devtools-logo-size);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}
.rakta-devtools-panel {
  position: fixed;
  z-index: 2147483646;
  width: var(--rakta-devtools-panel-width);
  max-height: min(620px, calc(100vh - 92px));
  overflow: auto;
  border: 1px solid var(--rakta-devtools-border);
  border-radius: 8px;
  background: var(--rakta-devtools-background);
  color: var(--rakta-devtools-text);
  box-shadow: var(--rakta-devtools-shadow);
  display: none;
}
.rakta-devtools-panel[data-open="true"] {
  display: block;
}
[data-position="bottom-left"] .rakta-devtools-indicator {
  bottom: var(--rakta-devtools-edge);
  left: var(--rakta-devtools-edge);
}
[data-position="bottom-right"] .rakta-devtools-indicator {
  bottom: var(--rakta-devtools-edge);
  right: var(--rakta-devtools-edge);
}
[data-position="top-left"] .rakta-devtools-indicator {
  top: var(--rakta-devtools-edge);
  left: var(--rakta-devtools-edge);
}
[data-position="top-right"] .rakta-devtools-indicator {
  top: var(--rakta-devtools-edge);
  right: var(--rakta-devtools-edge);
}
[data-position="bottom-left"] .rakta-devtools-panel {
  bottom: calc(var(--rakta-devtools-edge) + var(--rakta-devtools-button-size) + 10px);
  left: var(--rakta-devtools-edge);
}
[data-position="bottom-right"] .rakta-devtools-panel {
  bottom: calc(var(--rakta-devtools-edge) + var(--rakta-devtools-button-size) + 10px);
  right: var(--rakta-devtools-edge);
}
[data-position="top-left"] .rakta-devtools-panel {
  top: calc(var(--rakta-devtools-edge) + var(--rakta-devtools-button-size) + 10px);
  left: var(--rakta-devtools-edge);
}
[data-position="top-right"] .rakta-devtools-panel {
  top: calc(var(--rakta-devtools-edge) + var(--rakta-devtools-button-size) + 10px);
  right: var(--rakta-devtools-edge);
}
.rakta-devtools-header,
.rakta-devtools-row,
.rakta-devtools-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rakta-devtools-header {
  min-height: 44px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--rakta-devtools-border);
}
.rakta-devtools-title {
  font-weight: 700;
  letter-spacing: 0;
}
.rakta-devtools-version {
  margin-left: auto;
  color: var(--rakta-devtools-subtle);
  font-size: 12px;
}
.rakta-devtools-content {
  padding: 6px;
}
.rakta-devtools-row {
  width: 100%;
  min-height: 38px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--rakta-devtools-text);
  padding: 8px;
  text-align: left;
}
button.rakta-devtools-row {
  cursor: pointer;
}
button.rakta-devtools-row:hover {
  background: var(--rakta-devtools-surface);
}
.rakta-devtools-label {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--rakta-devtools-muted);
}
.rakta-devtools-value {
  flex: 0 1 auto;
  max-width: 58%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--rakta-devtools-text);
  font-weight: 600;
  text-align: right;
}
.rakta-devtools-pill {
  border: 1px solid var(--rakta-devtools-border);
  border-radius: 999px;
  padding: 2px 8px;
  background: var(--rakta-devtools-muted-surface);
  color: var(--rakta-devtools-text);
  font-size: 12px;
  font-weight: 700;
}
.rakta-devtools-section {
  border-top: 1px solid var(--rakta-devtools-border);
  margin-top: 6px;
  padding-top: 6px;
}
.rakta-devtools-route-tree {
  margin: 8px;
  padding: 10px;
  border: 1px solid var(--rakta-devtools-border);
  border-radius: 6px;
  background: var(--rakta-devtools-surface);
  color: var(--rakta-devtools-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.rakta-devtools-select,
.rakta-devtools-shortcut-input {
  width: 150px;
  max-width: 50%;
  border: 1px solid var(--rakta-devtools-border);
  border-radius: 6px;
  background: var(--rakta-devtools-surface);
  color: var(--rakta-devtools-text);
  padding: 6px 8px;
  outline: none;
}
.rakta-devtools-shortcut-input {
  width: 170px;
  cursor: pointer;
}
.rakta-devtools-button {
  min-height: 32px;
  border: 1px solid var(--rakta-devtools-border);
  border-radius: 6px;
  background: var(--rakta-devtools-surface);
  color: var(--rakta-devtools-text);
  padding: 6px 9px;
  cursor: pointer;
  outline: none;
}
.rakta-devtools-button:hover {
  border-color: var(--rakta-devtools-accent);
}
.rakta-devtools-button[data-danger="true"] {
  color: #ffb4b4;
}
.rakta-devtools-button[disabled] {
  cursor: wait;
  opacity: 0.65;
}
.rakta-devtools-footer {
  justify-content: space-between;
  border-top: 1px solid var(--rakta-devtools-border);
  padding: 10px 12px;
  color: var(--rakta-devtools-subtle);
  font-size: 12px;
}
.rakta-devtools-status {
  min-height: 18px;
  color: var(--rakta-devtools-muted);
  overflow-wrap: anywhere;
}
@media (max-width: 420px) {
  [data-rakta-devtools] {
    --rakta-devtools-edge: 12px;
  }
  .rakta-devtools-panel {
    max-height: calc(100vh - 82px);
  }
  .rakta-devtools-row {
    align-items: flex-start;
  }
  .rakta-devtools-value {
    max-width: 48%;
    white-space: normal;
  }
}
@media (prefers-color-scheme: light) {
  [data-rakta-devtools][data-theme="system"] {
    --rakta-devtools-background: #ffffff;
    --rakta-devtools-surface: #f7f7f8;
    --rakta-devtools-muted-surface: #eceef1;
    --rakta-devtools-text: #161719;
    --rakta-devtools-muted: #4d5159;
    --rakta-devtools-subtle: #737984;
    --rakta-devtools-border: #d9dde3;
    --rakta-devtools-shadow: 0 18px 55px rgba(16, 24, 40, 0.16);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .rakta-devtools-panel[data-open="true"] {
    animation: rakta-devtools-enter 0.12s ease-out;
  }
  @keyframes rakta-devtools-enter {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
`;

function createFallbackRouteInfo(
	options: DevIndicatorOptions,
): RaktaDevToolsRouteInfo {
	const pathname =
		typeof location === "undefined"
			? (options.routePath ?? "/")
			: location.pathname;

	return {
		currentPathname: pathname,
		matchedPattern: pathname,
		routeType: "page",
		renderMode: options.renderMode ?? "csr",
		renderModeSource: "default",
		routeSource: null,
		layoutFiles: [],
		pageFile: null,
		segments: [],
		isDynamic: false,
		paramNames: [],
		manifestGeneratedAt: "",
	};
}

export function normalizeKeyboardShortcut(
	keyboardEvent: KeyboardEvent,
): string | null {
	const key = normalizeShortcutKey(keyboardEvent.key);

	if (key === null) {
		return null;
	}

	const parts: string[] = [];

	if (keyboardEvent.ctrlKey) parts.push("Control");
	if (keyboardEvent.metaKey) parts.push("Meta");
	if (keyboardEvent.altKey) parts.push("Alt");
	if (keyboardEvent.shiftKey) parts.push("Shift");

	if (parts.length === 0) {
		return null;
	}

	parts.push(key);
	return parts.join("+");
}

function normalizeShortcutKey(key: string): string | null {
	if (["Control", "Shift", "Alt", "Meta"].includes(key)) {
		return null;
	}

	if (key.length === 1) {
		return key.toUpperCase();
	}

	return key;
}

export function isReservedShortcut(shortcut: string): boolean {
	return RESERVED_SHORTCUTS.has(shortcut);
}

export function shouldIgnoreShortcutTarget(
	target: EventTarget | null,
): boolean {
	if (
		target === null ||
		typeof Element === "undefined" ||
		!(target instanceof Element)
	) {
		return false;
	}

	const tagName = target.tagName.toLowerCase();
	return (
		(typeof HTMLInputElement !== "undefined" &&
			target instanceof HTMLInputElement) ||
		(typeof HTMLTextAreaElement !== "undefined" &&
			target instanceof HTMLTextAreaElement) ||
		(typeof HTMLSelectElement !== "undefined" &&
			target instanceof HTMLSelectElement) ||
		target.hasAttribute("contenteditable") ||
		tagName === "input" ||
		tagName === "textarea" ||
		tagName === "select"
	);
}

export function readRaktaDevToolsPreferences(): RaktaDevToolsPreferences {
	if (typeof localStorage === "undefined") {
		return DEFAULT_RAKTA_DEVTOOLS_PREFERENCES;
	}

	try {
		const storedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
		if (storedPreferences === null) {
			return DEFAULT_RAKTA_DEVTOOLS_PREFERENCES;
		}

		const parsedPreferences = JSON.parse(
			storedPreferences,
		) as Partial<RaktaDevToolsPreferences>;

		return {
			theme: isTheme(parsedPreferences.theme)
				? parsedPreferences.theme
				: DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.theme,
			position: isPosition(parsedPreferences.position)
				? parsedPreferences.position
				: DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.position,
			size: isSize(parsedPreferences.size)
				? parsedPreferences.size
				: DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.size,
			shortcut:
				typeof parsedPreferences.shortcut === "string" ||
				parsedPreferences.shortcut === null
					? parsedPreferences.shortcut
					: DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.shortcut,
		};
	} catch {
		return DEFAULT_RAKTA_DEVTOOLS_PREFERENCES;
	}
}

function saveRaktaDevToolsPreferences(
	preferences: RaktaDevToolsPreferences,
): void {
	if (typeof localStorage === "undefined") {
		return;
	}

	localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

function isTheme(theme: unknown): theme is RaktaDevToolsTheme {
	return theme === "system" || theme === "light" || theme === "dark";
}

function isPosition(position: unknown): position is RaktaDevToolsPosition {
	return (
		position === "bottom-left" ||
		position === "bottom-right" ||
		position === "top-left" ||
		position === "top-right"
	);
}

function isSize(size: unknown): size is RaktaDevToolsSize {
	return size === "small" || size === "medium" || size === "large";
}

function escapeHtml(htmlValue: string): string {
	return htmlValue
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function routeTypeLabel(routeType: string): string {
	return routeType === "page"
		? "Page"
		: routeType === "api"
			? "API"
			: routeType === "notFound"
				? "Not Found"
				: routeType.charAt(0).toUpperCase() + routeType.slice(1);
}

function renderModeLabel(renderMode: string): string {
	const labels: Readonly<Record<string, string>> = {
		csr: "Client",
		ssr: "Server",
		ssg: "Static",
		csg: "Client Generated",
		spa: "SPA",
		hybrid: "Hybrid",
		isr: "Prerendered",
		streaming_ssr: "Streaming",
		edge: "Edge",
	};

	return labels[renderMode] ?? renderMode.toUpperCase();
}

function buildRouteTree(routeInfo: RaktaDevToolsRouteInfo): string {
	const visibleSegments = routeInfo.segments.filter(
		(segment) => !segment.isGroup,
	);
	const pathLines =
		visibleSegments.length === 0
			? ["/"]
			: [
					"/",
					...visibleSegments.map((segment, segmentIndex) => {
						const branch =
							segmentIndex === visibleSegments.length - 1 ? "└──" : "├──";
						return `${branch} ${segment.raw}`;
					}),
				];

	const fileLines = [
		...routeInfo.layoutFiles.map((layoutFile) => `    layout: ${layoutFile}`),
		routeInfo.pageFile === null ? null : `    page: ${routeInfo.pageFile}`,
	].filter((line): line is string => line !== null);

	return [...pathLines, ...fileLines].join("\n");
}

function buildHeaderHtml(options: DevIndicatorOptions, title: string): string {
	return `
<div class="rakta-devtools-header">
  <img class="rakta-devtools-logo" src="${options.logoDataUrl}" alt="" aria-hidden="true" />
  <span class="rakta-devtools-title">${escapeHtml(title)}</span>
  <span class="rakta-devtools-version">v${escapeHtml(options.version)}</span>
</div>`;
}

function buildMainViewHtml(
	options: DevIndicatorOptions,
	state: RaktaDevToolsState,
): string {
	const routeInfo = state.routeInfo;
	const bundler = options.bundler ?? "Bun.build (CherbonsEngine)";
	const commandDisabled = state.activeCommand === null ? "" : " disabled";

	return `${buildHeaderHtml(options, FEATURE_NAME)}
<div class="rakta-devtools-content">
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Route</span>
    <span class="rakta-devtools-value">${escapeHtml(routeInfo.currentPathname)}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Status</span>
    <span class="rakta-devtools-pill">${escapeHtml(renderModeLabel(routeInfo.renderMode))}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Bundler</span>
    <span class="rakta-devtools-value">${escapeHtml(bundler)}</span>
  </div>
  <div class="rakta-devtools-section">
    <button class="rakta-devtools-row" type="button" data-action="route-info">
      <span class="rakta-devtools-label">Route Info</span>
      <span class="rakta-devtools-value" aria-hidden="true">›</span>
    </button>
    <button class="rakta-devtools-row" type="button" data-action="preferences">
      <span class="rakta-devtools-label">Preferences</span>
      <span class="rakta-devtools-value" aria-hidden="true">⚙</span>
    </button>
  </div>
  <div class="rakta-devtools-section">
    <button class="rakta-devtools-row" type="button" data-command="restart"${commandDisabled}>
      <span class="rakta-devtools-label">Restart Dev Server</span>
      <span class="rakta-devtools-value">${state.activeCommand === "restart" ? "Working" : "Run"}</span>
    </button>
    <button class="rakta-devtools-row" type="button" data-command="cache-reset"${commandDisabled}>
      <span class="rakta-devtools-label">Reset Bundler Cache</span>
      <span class="rakta-devtools-value">${state.activeCommand === "cache-reset" ? "Working" : "Run"}</span>
    </button>
  </div>
</div>
<div class="rakta-devtools-footer">
  <span class="rakta-devtools-status">${escapeHtml(state.commandMessage)}</span>
  <span>${escapeHtml(routeTypeLabel(routeInfo.routeType))}</span>
</div>`;
}

function buildRouteInfoViewHtml(
	options: DevIndicatorOptions,
	state: RaktaDevToolsState,
): string {
	const routeInfo = state.routeInfo;
	const paramNames =
		routeInfo.paramNames.length > 0 ? routeInfo.paramNames.join(", ") : "None";

	return `${buildHeaderHtml(options, "Route Info")}
<div class="rakta-devtools-content">
  <button class="rakta-devtools-button" type="button" data-action="main">Back</button>
  <div class="rakta-devtools-route-tree">${escapeHtml(buildRouteTree(routeInfo))}</div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Pathname</span>
    <span class="rakta-devtools-value">${escapeHtml(routeInfo.currentPathname)}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Pattern</span>
    <span class="rakta-devtools-value">${escapeHtml(routeInfo.matchedPattern ?? "Unmatched")}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Render Mode</span>
    <span class="rakta-devtools-value">${escapeHtml(renderModeLabel(routeInfo.renderMode))}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Mode Source</span>
    <span class="rakta-devtools-value">${escapeHtml(routeInfo.renderModeSource)}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Route Source</span>
    <span class="rakta-devtools-value">${escapeHtml(routeInfo.routeSource ?? "None")}</span>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Dynamic Params</span>
    <span class="rakta-devtools-value">${escapeHtml(paramNames)}</span>
  </div>
</div>
<div class="rakta-devtools-footer">
  <span>Manifest ${escapeHtml(routeInfo.manifestGeneratedAt || "in memory")}</span>
</div>`;
}

function buildSelectHtml<TOption extends string>(
	name: string,
	options: Readonly<Record<TOption, string>>,
	selectedValue: TOption,
): string {
	const choices = Object.entries(options)
		.map(([optionValue, label]) => {
			const selected = optionValue === selectedValue ? " selected" : "";
			return `<option value="${escapeHtml(optionValue)}"${selected}>${escapeHtml(String(label))}</option>`;
		})
		.join("");

	return `<select class="rakta-devtools-select" name="${escapeHtml(name)}">${choices}</select>`;
}

function buildPreferencesViewHtml(
	options: DevIndicatorOptions,
	state: RaktaDevToolsState,
): string {
	const shortcutLabel = state.preferences.shortcut ?? "Not set";

	return `${buildHeaderHtml(options, "Preferences")}
<div class="rakta-devtools-content">
  <button class="rakta-devtools-button" type="button" data-action="main">Back</button>
  <label class="rakta-devtools-row">
    <span class="rakta-devtools-label">Theme</span>
    ${buildSelectHtml("theme", THEME_LABELS, state.preferences.theme)}
  </label>
  <label class="rakta-devtools-row">
    <span class="rakta-devtools-label">Position</span>
    ${buildSelectHtml("position", POSITION_LABELS, state.preferences.position)}
  </label>
  <label class="rakta-devtools-row">
    <span class="rakta-devtools-label">Size</span>
    ${buildSelectHtml("size", SIZE_LABELS, state.preferences.size)}
  </label>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Hide DevTools Shortcut</span>
    <button class="rakta-devtools-shortcut-input" type="button" data-action="record-shortcut">${escapeHtml(shortcutLabel)}</button>
  </div>
  <div class="rakta-devtools-row">
    <span class="rakta-devtools-label">Shortcut</span>
    <button class="rakta-devtools-button" type="button" data-action="clear-shortcut">Clear</button>
    <button class="rakta-devtools-button" type="button" data-action="reset-shortcut">Reset</button>
  </div>
  <div class="rakta-devtools-section">
    <button class="rakta-devtools-row" type="button" data-action="hide-session">
      <span class="rakta-devtools-label">Hide DevTools for this session</span>
      <span class="rakta-devtools-value">Hide</span>
    </button>
    <div class="rakta-devtools-row">
      <span class="rakta-devtools-label">Disable for project</span>
      <span class="rakta-devtools-value">devTools: false</span>
    </div>
  </div>
</div>
<div class="rakta-devtools-footer">
  <span class="rakta-devtools-status">${escapeHtml(state.commandMessage)}</span>
</div>`;
}

function renderPanelHtml(
	options: DevIndicatorOptions,
	state: RaktaDevToolsState,
): string {
	if (state.panelView === "route-info") {
		return buildRouteInfoViewHtml(options, state);
	}

	if (state.panelView === "preferences") {
		return buildPreferencesViewHtml(options, state);
	}

	return buildMainViewHtml(options, state);
}

async function fetchRouteInfo(
	controlBasePath: string,
	pathname: string,
	fallbackRouteInfo: RaktaDevToolsRouteInfo,
): Promise<RaktaDevToolsRouteInfo> {
	try {
		const response = await fetch(
			`${controlBasePath}/route?pathname=${encodeURIComponent(pathname)}`,
			{ headers: { Accept: "application/json" } },
		);
		if (!response.ok) {
			return fallbackRouteInfo;
		}
		return (await response.json()) as RaktaDevToolsRouteInfo;
	} catch {
		return fallbackRouteInfo;
	}
}

async function runDevToolsCommand(
	controlBasePath: string,
	command: "restart" | "cache-reset",
): Promise<RaktaDevToolsCommandResult> {
	const endpoint = command === "restart" ? "restart" : "cache/reset";

	try {
		const response = await fetch(`${controlBasePath}/${endpoint}`, {
			method: "POST",
			headers: { Accept: "application/json" },
		});
		const result = (await response.json()) as RaktaDevToolsCommandResult;
		return result;
	} catch (caughtError) {
		return {
			ok: false,
			message:
				caughtError instanceof Error
					? caughtError.message
					: "Dev server command failed.",
		};
	}
}

function applyPreferences(
	root: HTMLElement,
	preferences: RaktaDevToolsPreferences,
): void {
	root.dataset.theme = preferences.theme;
	root.dataset.position = preferences.position;
	root.dataset.size = preferences.size;
}

function updateFirstPanelFocus(panel: HTMLElement): void {
	const focusableElement = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
	focusableElement?.focus();
}

function wasHiddenForSession(): boolean {
	if (typeof sessionStorage === "undefined") {
		return false;
	}

	return sessionStorage.getItem(SESSION_HIDDEN_STORAGE_KEY) === "true";
}

function hideForSession(root: HTMLElement): void {
	if (typeof sessionStorage !== "undefined") {
		sessionStorage.setItem(SESSION_HIDDEN_STORAGE_KEY, "true");
	}

	root.remove();
}

export function mountDevIndicator(options: DevIndicatorOptions): void {
	if (typeof document === "undefined" || wasHiddenForSession()) {
		return;
	}

	const controlBasePath = options.controlBasePath ?? CONTROL_BASE_PATH;
	const root = document.createElement("div");
	root.dataset.raktaDevtools = "";

	const style = document.createElement("style");
	style.dataset.raktaDevtoolsStyle = "";
	style.textContent = CSS;
	document.head.appendChild(style);

	const indicatorButton = document.createElement("button");
	indicatorButton.className = "rakta-devtools-indicator";
	indicatorButton.type = "button";
	indicatorButton.setAttribute("aria-label", "Open Rakta DevTools");
	indicatorButton.setAttribute("aria-haspopup", "dialog");
	indicatorButton.setAttribute("aria-expanded", "false");
	indicatorButton.title = FEATURE_NAME;

	const logoImage = document.createElement("img");
	logoImage.className = "rakta-devtools-logo";
	logoImage.src = options.logoDataUrl;
	logoImage.alt = "Rakta.js";
	indicatorButton.appendChild(logoImage);

	const panel = document.createElement("div");
	panel.className = "rakta-devtools-panel";
	panel.setAttribute("role", "dialog");
	panel.setAttribute("aria-label", FEATURE_NAME);
	panel.setAttribute("aria-modal", "false");
	panel.dataset.open = "false";

	root.appendChild(indicatorButton);
	root.appendChild(panel);
	document.body.appendChild(root);

	let restoreFocusElement: HTMLElement | null = null;
	let recordingShortcut = false;
	const state: RaktaDevToolsState = {
		isOpen: false,
		panelView: "main",
		preferences: readRaktaDevToolsPreferences(),
		routeInfo: options.routeInfo ?? createFallbackRouteInfo(options),
		activeCommand: null,
		commandMessage: "",
	};

	function render(): void {
		applyPreferences(root, state.preferences);
		panel.dataset.open = String(state.isOpen);
		indicatorButton.setAttribute("aria-expanded", String(state.isOpen));
		panel.innerHTML = renderPanelHtml(options, state);
		bindPanelActions();
	}

	function openPanel(): void {
		restoreFocusElement =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: indicatorButton;
		state.isOpen = true;
		render();
		updateFirstPanelFocus(panel);
		refreshRouteInfo();
	}

	function closePanel(): void {
		state.isOpen = false;
		state.panelView = "main";
		render();
		(restoreFocusElement ?? indicatorButton).focus();
	}

	function togglePanel(): void {
		if (state.isOpen) {
			closePanel();
		} else {
			openPanel();
		}
	}

	async function refreshRouteInfo(): Promise<void> {
		const fallbackRouteInfo = {
			...state.routeInfo,
			currentPathname: window.location.pathname,
		};
		state.routeInfo = await fetchRouteInfo(
			controlBasePath,
			window.location.pathname,
			fallbackRouteInfo,
		);
		if (state.isOpen) {
			render();
		}
	}

	function updatePreferences(
		nextPreferences: RaktaDevToolsPreferences,
		message = "",
	): void {
		state.preferences = nextPreferences;
		state.commandMessage = message;
		saveRaktaDevToolsPreferences(nextPreferences);
		render();
	}

	async function runCommand(command: "restart" | "cache-reset"): Promise<void> {
		if (state.activeCommand !== null) {
			return;
		}

		state.activeCommand = command;
		state.commandMessage =
			command === "restart"
				? "Restarting Rakta dev server..."
				: "Resetting Rakta bundler cache...";
		render();

		const result = await runDevToolsCommand(controlBasePath, command);
		state.activeCommand = null;
		state.commandMessage = result.message;
		render();

		if (result.ok) {
			setTimeout(() => window.location.reload(), 350);
		}
	}

	function bindPanelActions(): void {
		panel.querySelectorAll<HTMLElement>("[data-action]").forEach((button) => {
			button.addEventListener("click", () => {
				const action = button.dataset.action;
				if (action === "main") state.panelView = "main";
				if (action === "route-info") state.panelView = "route-info";
				if (action === "preferences") state.panelView = "preferences";
				if (action === "hide-session") {
					hideForSession(root);
					return;
				}
				if (action === "clear-shortcut") {
					updatePreferences(
						{ ...state.preferences, shortcut: null },
						"Shortcut cleared.",
					);
					return;
				}
				if (action === "reset-shortcut") {
					updatePreferences(
						{
							...state.preferences,
							shortcut: DEFAULT_RAKTA_DEVTOOLS_PREFERENCES.shortcut,
						},
						"Shortcut reset.",
					);
					return;
				}
				if (action === "record-shortcut") {
					recordingShortcut = true;
					button.textContent = "Press shortcut...";
					button.focus();
					return;
				}
				render();
				updateFirstPanelFocus(panel);
			});
		});

		panel
			.querySelectorAll<HTMLSelectElement>("select[name]")
			.forEach((select) => {
				select.addEventListener("change", () => {
					const preferenceName = select.name;
					const selectedPreference = select.value;

					if (preferenceName === "theme" && isTheme(selectedPreference)) {
						updatePreferences({
							...state.preferences,
							theme: selectedPreference,
						});
					}
					if (preferenceName === "position" && isPosition(selectedPreference)) {
						updatePreferences({
							...state.preferences,
							position: selectedPreference,
						});
					}
					if (preferenceName === "size" && isSize(selectedPreference)) {
						updatePreferences({
							...state.preferences,
							size: selectedPreference,
						});
					}
				});
			});

		panel.querySelectorAll<HTMLElement>("[data-command]").forEach((button) => {
			button.addEventListener("click", () => {
				const command = button.dataset.command;
				if (command === "restart" || command === "cache-reset") {
					void runCommand(command);
				}
			});
		});
	}

	indicatorButton.addEventListener("click", togglePanel);

	document.addEventListener("keydown", (keyboardEvent) => {
		if (recordingShortcut) {
			keyboardEvent.preventDefault();
			const shortcut = normalizeKeyboardShortcut(keyboardEvent);
			if (shortcut === null) {
				return;
			}
			if (isReservedShortcut(shortcut)) {
				state.commandMessage = "That shortcut is reserved by the browser.";
				recordingShortcut = false;
				render();
				return;
			}
			recordingShortcut = false;
			updatePreferences(
				{ ...state.preferences, shortcut },
				`Shortcut set to ${shortcut}.`,
			);
			return;
		}

		if (keyboardEvent.key === "Escape" && state.isOpen) {
			keyboardEvent.preventDefault();
			closePanel();
			return;
		}

		if (
			state.preferences.shortcut !== null &&
			!shouldIgnoreShortcutTarget(keyboardEvent.target) &&
			normalizeKeyboardShortcut(keyboardEvent) === state.preferences.shortcut
		) {
			keyboardEvent.preventDefault();
			hideForSession(root);
		}
	});

	document.addEventListener("click", (mouseEvent) => {
		if (
			state.isOpen &&
			mouseEvent.target instanceof Node &&
			!root.contains(mouseEvent.target)
		) {
			closePanel();
		}
	});

	const originalPushState = history.pushState.bind(history);
	history.pushState = (...historyArguments) => {
		originalPushState(...historyArguments);
		void refreshRouteInfo();
	};
	window.addEventListener("popstate", () => {
		void refreshRouteInfo();
	});

	render();
	void refreshRouteInfo();
}
