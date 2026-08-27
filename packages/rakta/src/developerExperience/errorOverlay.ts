/**
 * Rakta.js Error Overlay
 *
 * Development-only client-side error surface matching the visual quality of
 * Next.js 15.2 error overlay while remaining fully Rakta.js-native.
 *
 * Architecture:
 *   Runtime errors  ─┐
 *   Build errors    ─┼──► canonical error store ──► overlay DOM
 *   Promise errors  ─┘
 *
 * The overlay is injected into the HTML shell by buildClientEntry() only when
 * devTools is enabled (development mode).  It is excluded from production.
 *
 * Visual reference: Next.js 15.2 error overlay screenshot
 *   - Dark rounded container with outer dark backdrop
 *   - 1/N navigation header + Rakta version badge
 *   - Red "Unhandled Runtime Error" / "Build Error" severity badge
 *   - Red error message
 *   - Source location line
 *   - Code frame with highlighted failing line + caret
 *   - Call Stack section with app / framework frame separation
 *   - "Was this helpful?" feedback strip
 */

export const RAKTA_ERROR_OVERLAY_VERSION = "1.2.1";

// Canonical error types

export type RaktaErrorSeverity =
	| "runtime"
	| "build"
	| "promise"
	| "module"
	| "route"
	| "ssr"
	| "hydration"
	| "config";

export interface RaktaErrorFrame {
	readonly functionName: string;
	readonly file: string;
	readonly line: number;
	readonly column: number;
	readonly isApplicationFrame: boolean;
}

export interface RaktaErrorCodeFrame {
	readonly file: string;
	readonly line: number;
	readonly column: number;
	readonly lines: ReadonlyArray<{
		readonly number: number;
		readonly text: string;
	}>;
}

export interface RaktaCanonicalError {
	readonly id: string;
	readonly severity: RaktaErrorSeverity;
	readonly message: string;
	readonly componentName?: string;
	readonly codeFrame?: RaktaErrorCodeFrame;
	readonly frames: ReadonlyArray<RaktaErrorFrame>;
	readonly timestamp: number;
}

// Error CSS

const OVERLAY_CSS = `
[data-rakta-error-overlay] {
  all: initial;
  position: fixed;
  inset: 0;
  z-index: 2147483648;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
  color-scheme: dark;
}
[data-rakta-error-overlay] * {
  box-sizing: border-box;
}
.rakta-eo-shell {
  width: 100%;
  max-width: 780px;
  max-height: calc(100vh - 32px);
  background: #111214;
  border: 1px solid #2a2d35;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 32px 96px rgba(0, 0, 0, 0.64);
  color: #e8eaed;
}
.rakta-eo-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #1f2025;
  flex-shrink: 0;
}
.rakta-eo-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8b909a;
}
.rakta-eo-nav button {
  all: unset;
  cursor: pointer;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid #2e3039;
  color: #9ca0aa;
  font-size: 13px;
  line-height: 1;
  background: #1a1c21;
}
.rakta-eo-nav button:hover { border-color: #c60005; color: #fff; }
.rakta-eo-nav button:disabled { opacity: 0.35; cursor: not-allowed; }
.rakta-eo-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
}
.rakta-eo-badge-runtime {
  background: rgba(198, 0, 5, 0.10);
  border: 1px solid rgba(198, 0, 5, 0.30);
  color: #ff4d4d;
}
.rakta-eo-badge-build {
  background: rgba(234, 126, 0, 0.10);
  border: 1px solid rgba(234, 126, 0, 0.30);
  color: #f8a44c;
}
.rakta-eo-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.rakta-eo-version-chip {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: #1a1c21;
  border: 1px solid #2e3039;
  color: #8b909a;
  letter-spacing: 0.02em;
}
.rakta-eo-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 0;
  scrollbar-width: thin;
  scrollbar-color: #2e3039 transparent;
}
.rakta-eo-message {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: #ff4d4d;
  margin: 0 0 12px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.rakta-eo-component-hint {
  font-size: 13px;
  color: #ff7070;
  margin: 0 0 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-weight: 500;
}
.rakta-eo-source-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #18191e;
  border: 1px solid #2a2d35;
  border-radius: 7px 7px 0 0;
  font-size: 12px;
  color: #9ca0aa;
}
.rakta-eo-source-label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rakta-eo-source-icon {
  font-size: 14px;
}
.rakta-eo-copy-btn {
  all: unset;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #2e3039;
  background: #1f2025;
  color: #9ca0aa;
  font-size: 11px;
}
.rakta-eo-copy-btn:hover { border-color: #c60005; color: #fff; }
.rakta-eo-code-frame {
  background: #0d0e10;
  border: 1px solid #2a2d35;
  border-top: none;
  border-radius: 0 0 7px 7px;
  padding: 10px 0;
  overflow-x: auto;
  margin-bottom: 20px;
  scrollbar-width: thin;
  scrollbar-color: #2e3039 transparent;
}
.rakta-eo-code-line {
  display: flex;
  align-items: flex-start;
  padding: 0 12px;
  min-height: 20px;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre;
}
.rakta-eo-code-line-err {
  background: rgba(198, 0, 5, 0.10);
}
.rakta-eo-line-num {
  width: 28px;
  color: #4a4e5a;
  user-select: none;
  flex-shrink: 0;
  text-align: right;
  margin-right: 12px;
}
.rakta-eo-code-line-err .rakta-eo-line-num { color: #ff4d4d; }
.rakta-eo-line-gutter {
  width: 14px;
  flex-shrink: 0;
  color: #ff4d4d;
  font-weight: bold;
}
.rakta-eo-code-text { flex: 1; }
.rakta-eo-caret-row {
  display: flex;
  padding: 0 12px;
  white-space: pre;
  font-size: 12.5px;
  line-height: 1;
  height: 12px;
}
.rakta-eo-caret {
  margin-left: calc(28px + 12px + 14px);
  color: #ff4d4d;
  font-weight: bold;
}
.rakta-eo-callstack-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.rakta-eo-callstack-title {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaed;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rakta-eo-callstack-count {
  padding: 1px 7px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: #2a2d35;
  color: #9ca0aa;
}
.rakta-eo-toggle-btn {
  all: unset;
  cursor: pointer;
  font-size: 12px;
  color: #5b7ff9;
  display: flex;
  align-items: center;
  gap: 4px;
}
.rakta-eo-toggle-btn:hover { text-decoration: underline; }
.rakta-eo-frame {
  padding: 8px 0;
  border-bottom: 1px solid #1f2025;
}
.rakta-eo-frame:last-child { border-bottom: none; }
.rakta-eo-frame-fn {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaed;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.rakta-eo-frame-fn-ignored { color: #5a5e69; font-weight: 400; }
.rakta-eo-frame-link-icon {
  font-size: 11px;
  color: #4a4e5a;
  cursor: pointer;
}
.rakta-eo-frame-link-icon:hover { color: #5b7ff9; }
.rakta-eo-frame-loc {
  font-size: 12px;
  color: #5a5e69;
}
.rakta-eo-frame-loc-app { color: #8b909a; }
.rakta-eo-ignored-group {
  padding: 6px 0;
  display: none;
}
.rakta-eo-ignored-group[data-expanded="true"] { display: block; }
.rakta-eo-footer {
  padding: 14px 20px;
  border-top: 1px solid #1f2025;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}
.rakta-eo-helpful-label {
  font-size: 12px;
  color: #5b7ff9;
  margin-right: 4px;
}
.rakta-eo-feedback-btn {
  all: unset;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #2a2d35;
  background: #1a1c21;
  color: #8b909a;
  font-size: 15px;
  line-height: 1;
  transition: border-color 0.12s, color 0.12s;
}
.rakta-eo-feedback-btn:hover { border-color: #5b7ff9; color: #fff; }
.rakta-eo-feedback-btn[data-selected="true"] {
  border-color: #5b7ff9;
  background: rgba(91, 127, 249, 0.12);
  color: #5b7ff9;
}
@media (max-width: 600px) {
  .rakta-eo-topbar { flex-wrap: wrap; gap: 8px; }
  .rakta-eo-message { font-size: 13px; }
}
@media (prefers-reduced-motion: reduce) {
  [data-rakta-error-overlay] { backdrop-filter: none; }
}
`;

// Error normalizer

function normalizeStack(error: Error): ReadonlyArray<RaktaErrorFrame> {
	const stack = error.stack ?? "";
	const lines = stack
		.split("\n")
		.slice(1)
		.map((line) => line.trim());

	return lines
		.map((line): RaktaErrorFrame | null => {
			// "at FunctionName (file:line:col)"
			const match = line.match(/^at\s+([^\s(]+)?\s*\(?([^)]+):(\d+):(\d+)\)?$/);
			if (!match) return null;
			const [, fn, file, lineStr, colStr] = match;
			if (!file) return null;
			const lineNum = Number(lineStr ?? "0");
			const colNum = Number(colStr ?? "0");
			const isApp =
				!file.includes("node_modules") &&
				!file.includes("__rakta") &&
				!file.includes("rakta/src") &&
				!file.includes("webpack") &&
				!file.includes("react-dom") &&
				!file.includes("react/") &&
				!file.includes("bun:");

			return {
				functionName: fn ?? "<anonymous>",
				file: file ?? "",
				line: lineNum,
				column: colNum,
				isApplicationFrame: isApp,
			};
		})
		.filter((frame): frame is RaktaErrorFrame => frame !== null);
}

function buildCodeFrame(
	frames: ReadonlyArray<RaktaErrorFrame>,
): RaktaErrorCodeFrame | undefined {
	const appFrame = frames.find((frame) => frame.isApplicationFrame);
	if (!appFrame?.file) return undefined;

	// Best-effort: extract a short relative path display
	const fileDisplay = appFrame.file
		.replace(/^file:\/\//, "")
		.replace(/^.*[/\\](app[/\\])/, "app/")
		.replace(/^.*[/\\](src[/\\])/, "src/")
		.replace(/\\/g, "/");

	// We can't read the filesystem from the browser - return a placeholder frame
	// that the overlay renders with a hint to check the source.
	return {
		file: fileDisplay,
		line: appFrame.line,
		column: appFrame.column,
		lines: [],
	};
}

function normalizeError(
	severity: RaktaErrorSeverity,
	error: Error | string,
	counter: number,
): RaktaCanonicalError {
	const errorObj = typeof error === "string" ? new Error(error) : error;
	const frames = normalizeStack(errorObj);
	const codeFrame = buildCodeFrame(frames);

	// Extract "Check the render method of `X`." hint if present
	const componentHint = errorObj.message.match(
		/Check the render method of `([^`]+)`/,
	)?.[1];

	return {
		id: `${Date.now()}-${counter}`,
		severity,
		message: errorObj.message,
		...(componentHint ? { componentName: componentHint } : {}),
		...(codeFrame ? { codeFrame } : {}),
		frames,
		timestamp: Date.now(),
	};
}

// HTML builder helpers

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function severityBadgeHtml(severity: RaktaErrorSeverity): string {
	const label =
		severity === "build"
			? "Build Error"
			: severity === "promise"
				? "Unhandled Promise Rejection"
				: severity === "module"
					? "Module Error"
					: severity === "ssr"
						? "Server Render Error"
						: severity === "hydration"
							? "Hydration Error"
							: "Unhandled Runtime Error";

	const cls =
		severity === "build" ? "rakta-eo-badge-build" : "rakta-eo-badge-runtime";

	return `<span class="rakta-eo-badge ${cls}"><span class="rakta-eo-badge-dot"></span>${escapeHtml(label)}</span>`;
}

function codeFrameHtml(frame: RaktaErrorCodeFrame, errorCol: number): string {
	const srcBar = `<div class="rakta-eo-source-bar">
    <span class="rakta-eo-source-label">
      <span class="rakta-eo-source-icon">🧩</span>
      <span>${escapeHtml(frame.file)} (${frame.line}:${frame.column})</span>
    </span>
    <button class="rakta-eo-copy-btn" data-action="copy-location" data-file="${escapeHtml(frame.file)}" data-line="${frame.line}" data-col="${frame.column}" aria-label="Copy file location">⎘ Copy</button>
  </div>`;

	if (frame.lines.length === 0) {
		// No source lines available (browser can't read disk) - show placeholder
		return `${srcBar}<div class="rakta-eo-code-frame" style="padding:14px 16px;color:#5a5e69;font-size:12px;">
      Source not available in browser context.
      Open ${escapeHtml(frame.file)} at line ${frame.line} in your editor.
    </div>`;
	}

	const linesHtml = frame.lines
		.map((sourceLine) => {
			const isError = sourceLine.number === frame.line;
			const gutter = isError ? ">" : " ";
			const lineClass = isError ? " rakta-eo-code-line-err" : "";
			return `<div class="rakta-eo-code-line${lineClass}">
        <span class="rakta-eo-line-num">${sourceLine.number}</span>
        <span class="rakta-eo-line-gutter">${gutter}</span>
        <span class="rakta-eo-code-text">${escapeHtml(sourceLine.text)}</span>
      </div>`;
		})
		.join("");

	const caretPad = " ".repeat(Math.max(0, errorCol - 1));
	const caretHtml = `<div class="rakta-eo-caret-row"><span class="rakta-eo-caret">${escapeHtml(caretPad)}^</span></div>`;

	return `${srcBar}<div class="rakta-eo-code-frame">${linesHtml}${caretHtml}</div>`;
}

function callStackHtml(frames: ReadonlyArray<RaktaErrorFrame>): string {
	const appFrames = frames.filter((frame) => frame.isApplicationFrame);
	const ignoredFrames = frames.filter((frame) => !frame.isApplicationFrame);

	const renderFrame = (frame: RaktaErrorFrame): string => {
		const fnClass = frame.isApplicationFrame
			? "rakta-eo-frame-fn"
			: "rakta-eo-frame-fn rakta-eo-frame-fn-ignored";
		const locClass = frame.isApplicationFrame
			? "rakta-eo-frame-loc rakta-eo-frame-loc-app"
			: "rakta-eo-frame-loc";
		const shortFile = frame.file
			.replace(/^file:\/\//, "")
			.replace(/^.*[/\\](app[/\\])/, "app/")
			.replace(/^.*[/\\](src[/\\])/, "src/")
			.replace(/\\/g, "/");
		return `<div class="rakta-eo-frame">
      <div class="${fnClass}">
        ${escapeHtml(frame.functionName)}
        <span class="rakta-eo-frame-link-icon" title="Copy location" data-action="copy-frame" data-file="${escapeHtml(frame.file)}" data-line="${frame.line}" data-col="${frame.column}">⎘</span>
      </div>
      <div class="${locClass}">${escapeHtml(shortFile)} (${frame.line}:${frame.column})</div>
    </div>`;
	};

	const appHtml = appFrames.map(renderFrame).join("");
	const ignoredHtml =
		ignoredFrames.length > 0
			? `<button class="rakta-eo-toggle-btn" data-action="toggle-ignored" aria-expanded="false">
          Show ${ignoredFrames.length} ignore-listed frame${ignoredFrames.length !== 1 ? "s" : ""} ↕
        </button>
        <div class="rakta-eo-ignored-group" data-ignored-group>
          ${ignoredFrames.map(renderFrame).join("")}
        </div>`
			: "";

	return `<div class="rakta-eo-callstack-header">
    <span class="rakta-eo-callstack-title">
      Call Stack
      <span class="rakta-eo-callstack-count">${frames.length}</span>
    </span>
    ${ignoredFrames.length > 0 ? `<button class="rakta-eo-toggle-btn" data-action="toggle-all-ignored" aria-expanded="false">Show ${ignoredFrames.length} ignore-listed frame${ignoredFrames.length !== 1 ? "s" : ""} ↕</button>` : ""}
  </div>
  ${appHtml}
  ${ignoredHtml}`;
}

function buildOverlayHtml(
	errors: ReadonlyArray<RaktaCanonicalError>,
	currentIndex: number,
): string {
	if (errors.length === 0) return "";
	const error = errors[currentIndex];
	if (!error) return "";

	const prevDisabled = currentIndex === 0 ? " disabled" : "";
	const nextDisabled = currentIndex === errors.length - 1 ? " disabled" : "";

	const codeFramePart = error.codeFrame
		? codeFrameHtml(error.codeFrame, error.codeFrame.column)
		: "";

	const componentHintHtml = error.componentName
		? `<p class="rakta-eo-component-hint">Check the render method of <code>\`${escapeHtml(error.componentName)}\`</code>.</p>`
		: "";

	return `
  <div class="rakta-eo-topbar">
    <div class="rakta-eo-nav">
      <button data-action="prev-error" aria-label="Previous error"${prevDisabled}>‹</button>
      <span aria-live="polite" aria-atomic="true">${currentIndex + 1}/${errors.length}</span>
      <button data-action="next-error" aria-label="Next error"${nextDisabled}>›</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      ${severityBadgeHtml(error.severity)}
    </div>
    <span class="rakta-eo-version-chip">⩛ Rakta.js ${RAKTA_ERROR_OVERLAY_VERSION} CherbonsEngine</span>
  </div>
  <div class="rakta-eo-body">
    <p class="rakta-eo-message" role="alert">${escapeHtml(error.message)}</p>
    ${componentHintHtml}
    ${codeFramePart}
    ${callStackHtml(error.frames)}
    <div style="height:20px;"></div>
  </div>
  <div class="rakta-eo-footer">
    <span class="rakta-eo-helpful-label">Was this helpful?</span>
    <button class="rakta-eo-feedback-btn" data-action="feedback-yes" aria-label="Yes, this was helpful">👍</button>
    <button class="rakta-eo-feedback-btn" data-action="feedback-no" aria-label="No, this was not helpful">👎</button>
  </div>`;
}

// Overlay controller

export function mountErrorOverlay(): () => void {
	if (typeof document === "undefined") return () => {};

	const errors: RaktaCanonicalError[] = [];
	let currentIndex = 0;
	let errorCounter = 0;

	// Inject stylesheet
	const style = document.createElement("style");
	style.dataset.raktaErrorOverlayStyle = "";
	style.textContent = OVERLAY_CSS;
	document.head.appendChild(style);

	// Container element
	const container = document.createElement("div");
	container.dataset.raktaErrorOverlay = "";
	container.setAttribute("role", "dialog");
	container.setAttribute("aria-modal", "true");
	container.setAttribute("aria-label", "Rakta.js Error Overlay");
	container.style.display = "none";

	const shell = document.createElement("div");
	shell.className = "rakta-eo-shell";
	container.appendChild(shell);

	document.body.appendChild(container);

	function render(): void {
		if (errors.length === 0) {
			container.style.display = "none";
			return;
		}
		container.style.display = "flex";
		shell.innerHTML = buildOverlayHtml(errors, currentIndex);
		bindShellEvents();

		// Focus management
		const firstFocusable = shell.querySelector<HTMLElement>(
			"button:not([disabled])",
		);
		firstFocusable?.focus();
	}

	function bindShellEvents(): void {
		shell.addEventListener("click", (event) => {
			const target = (event.target as HTMLElement).closest(
				"[data-action]",
			) as HTMLElement | null;
			if (!target) return;
			const action = target.dataset.action;

			if (action === "prev-error") {
				currentIndex = Math.max(0, currentIndex - 1);
				render();
			} else if (action === "next-error") {
				currentIndex = Math.min(errors.length - 1, currentIndex + 1);
				render();
			} else if (
				action === "toggle-ignored" ||
				action === "toggle-all-ignored"
			) {
				const group = shell.querySelector<HTMLElement>("[data-ignored-group]");
				if (group) {
					const expanded = group.dataset.expanded === "true";
					group.dataset.expanded = expanded ? "false" : "true";
					target.textContent = expanded
						? (target.textContent?.replace(/^Hide/, "Show") ?? "")
						: (target.textContent?.replace(/^Show/, "Hide") ?? "");
					target.setAttribute("aria-expanded", expanded ? "false" : "true");
				}
			} else if (action === "copy-location" || action === "copy-frame") {
				const file = target.dataset.file ?? "";
				const line = target.dataset.line ?? "";
				const col = target.dataset.col ?? "";
				navigator.clipboard.writeText(`${file}:${line}:${col}`).catch(() => {});
			} else if (action === "feedback-yes") {
				target.dataset.selected = "true";
				const no = shell.querySelector<HTMLElement>(
					'[data-action="feedback-no"]',
				);
				if (no) no.dataset.selected = "false";
			} else if (action === "feedback-no") {
				target.dataset.selected = "true";
				const yes = shell.querySelector<HTMLElement>(
					'[data-action="feedback-yes"]',
				);
				if (yes) yes.dataset.selected = "false";
			}
		});
	}

	function addError(error: RaktaCanonicalError): void {
		// Deduplicate by message
		const existing = errors.find(
			(existingError) => existingError.message === error.message,
		);
		if (existing) return;
		errors.push(error);
		currentIndex = errors.length - 1;
		render();
	}

	function clearErrors(): void {
		errors.length = 0;
		currentIndex = 0;
		render();
	}

	// Runtime error capture

	const handleWindowError = (event: ErrorEvent): void => {
		event.preventDefault();
		const err =
			event.error instanceof Error ? event.error : new Error(event.message);
		addError(normalizeError("runtime", err, ++errorCounter));
	};

	const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
		const err =
			event.reason instanceof Error
				? event.reason
				: new Error(String(event.reason));
		addError(normalizeError("promise", err, ++errorCounter));
	};

	window.addEventListener("error", handleWindowError);
	window.addEventListener("unhandledrejection", handleUnhandledRejection);

	// Escape to close

	const handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === "Escape" && errors.length > 0) {
			clearErrors();
		}
	};
	document.addEventListener("keydown", handleKeyDown);

	// HMR integration via the existing Rakta.js livereload WebSocket.
	// The socket sends JSON: { type, ... }

	let hmrUnsubscribe: (() => void) | null = null;

	const attachHmr = (): void => {
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${location.host}/__livereload`);

		ws.addEventListener("message", (messageEvent) => {
			try {
				const data = JSON.parse(messageEvent.data as string) as {
					type?: string;
					message?: string;
					file?: string;
					line?: number;
					column?: number;
					frame?: string;
				};

				if (data.type === "build-error" || data.type === "bundle-error") {
					const err = new Error(data.message ?? "Build failed");
					const buildError = normalizeError("build", err, ++errorCounter);
					addError(buildError);
				} else if (
					data.type === "fast-refresh" ||
					data.type === "hmr:update" ||
					data.type === "devtools:restart" ||
					data.type === "devtools:cache-reset"
				) {
					// Successful recompile - clear overlay
					clearErrors();
				}
			} catch {
				// Non-JSON message - ignore
			}
		});

		hmrUnsubscribe = () => ws.close();
	};

	// Attach after a short delay to avoid racing the main HMR socket
	const attachTimer = setTimeout(attachHmr, 800);

	// Expose public API on window for devTools integration

	(
		window as typeof window & {
			__rakta_error_overlay__?: {
				addError: typeof addError;
				clearErrors: typeof clearErrors;
			};
		}
	).__rakta_error_overlay__ = { addError, clearErrors };

	return () => {
		clearTimeout(attachTimer);
		hmrUnsubscribe?.();
		window.removeEventListener("error", handleWindowError);
		window.removeEventListener("unhandledrejection", handleUnhandledRejection);
		document.removeEventListener("keydown", handleKeyDown);
		container.remove();
		style.remove();
	};
}
