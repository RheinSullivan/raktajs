// Rakta.js Dev Indicator
//
// A floating development tool injected only in dev mode.
// Zero production cost: this file is only ever included in clientEntry
// when process.env.NODE_ENV === "development". Production builds tree-shake
// the entire module because the import is behind a dead-code elimination guard.
//
// UX inspired by (but independently implemented from) common dev overlay
// patterns. No competitor source code, CSS, branding, or naming is used.
//
// The Rakta.js SVG logo (docs/assets/Rakta.js.svg) is inlined as a data URL
// at build time so the indicator has no runtime filesystem dependency.

export interface DevIndicatorOptions {
	/** Current Rakta.js version shown in the panel header. */
	readonly version: string;
	/** Active route path (e.g. "/dashboard"). */
	readonly routePath?: string;
	/** Active render mode (e.g. "csr", "ssr"). */
	readonly renderMode?: string;
	/** Bundler name shown in the panel. */
	readonly bundler?: string;
	/** Base64-encoded SVG data URL for the Rakta.js logo. */
	readonly logoDataUrl: string;
}

// Inline styles
// All styles are scoped under [data-rakta-dev] to avoid leaking into the app.

const CSS = `
[data-rakta-dev] {
  all: initial;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  color: #e5e7eb;
  box-sizing: border-box;
}
[data-rakta-dev] * { box-sizing: border-box; }

#rakta-dev-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 2147483647;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #111;
  border: 1.5px solid #2a2a2a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,.5);
  transition: border-color .15s, box-shadow .15s;
  outline: none;
}
#rakta-dev-btn:hover,
#rakta-dev-btn:focus-visible {
  border-color: #C60005;
  box-shadow: 0 2px 16px rgba(198,0,5,.35);
}
#rakta-dev-btn img {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  pointer-events: none;
  display: block;
}

#rakta-dev-panel {
  position: fixed;
  bottom: 64px;
  left: 20px;
  z-index: 2147483647;
  width: 280px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,.7);
  overflow: hidden;
  display: none;
  flex-direction: column;
}
#rakta-dev-panel.open { display: flex; }

.rakta-dev-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #1c1c1c;
  font-weight: 600;
  font-size: 12px;
  color: #9ca3af;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.rakta-dev-header img {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}
.rakta-dev-version {
  margin-left: auto;
  color: #C60005;
  font-weight: 700;
}

.rakta-dev-section {
  border-bottom: 1px solid #1a1a1a;
}
.rakta-dev-row {
  display: flex;
  align-items: center;
  padding: 9px 14px;
  gap: 8px;
  cursor: default;
  transition: background .1s;
}
.rakta-dev-row:hover { background: #161616; }
.rakta-dev-row.clickable { cursor: pointer; }
.rakta-dev-label {
  flex: 1;
  color: #d1d5db;
  font-size: 13px;
}
.rakta-dev-value {
  color: #6b7280;
  font-size: 12px;
  text-align: right;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rakta-dev-value.highlight { color: #60a5fa; }
.rakta-dev-arrow {
  color: #374151;
  font-size: 11px;
}

.rakta-dev-perf {
  padding: 10px 14px;
  display: none;
  flex-direction: column;
  gap: 5px;
}
.rakta-dev-perf.open { display: flex; }
.rakta-dev-perf-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.rakta-dev-perf-label { color: #6b7280; }
.rakta-dev-perf-val { color: #d1d5db; font-variant-numeric: tabular-nums; }
.rakta-dev-perf-val.slow { color: #f59e0b; }
.rakta-dev-perf-val.bottleneck { color: #ef4444; }

@media (prefers-reduced-motion: no-preference) {
  #rakta-dev-panel { animation: rakta-fade-in .12s ease; }
  @keyframes rakta-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
`;

// Performance trace ────────────────────────────────────────────────────────

interface PerfTrace {
	networkMs: number;
	parseMs: number;
	stateMs: number;
	renderMs: number;
	paintMs: number;
	totalMs: number;
}

function collectPerfTrace(): PerfTrace | null {
	if (typeof performance === "undefined") return null;

	const nav = performance.getEntriesByType("navigation")[0] as
		| PerformanceNavigationTiming
		| undefined;
	if (!nav) return null;

	const networkMs = Math.round(nav.responseEnd - nav.fetchStart);
	const parseMs = Math.round(
		(nav.domInteractive || nav.domContentLoadedEventEnd) - nav.responseEnd,
	);
	const paintEntry = performance.getEntriesByName("first-contentful-paint")[0];
	const paintMs = paintEntry ? Math.round(paintEntry.startTime) : 0;
	const totalMs = Math.round(nav.loadEventEnd - nav.fetchStart);

	// State and render are measured via Rakta performance marks if available.
	const stateMs = Math.round(
		getMark("rakta:state-end") - getMark("rakta:state-start"),
	);
	const renderMs = Math.round(
		getMark("rakta:render-end") - getMark("rakta:render-start"),
	);

	return {
		networkMs: Math.max(0, networkMs),
		parseMs: Math.max(0, parseMs),
		stateMs: Math.max(0, stateMs),
		renderMs: Math.max(0, renderMs),
		paintMs: Math.max(0, paintMs),
		totalMs: Math.max(0, totalMs),
	};
}

function getMark(name: string): number {
	const entries = performance.getEntriesByName(name, "mark");
	return entries.length > 0 && entries[0] ? entries[0].startTime : 0;
}

// HTML builder ─

function buildPanelHtml(opts: DevIndicatorOptions): string {
	const route = opts.routePath ?? "Unknown";
	const mode = opts.renderMode ?? "Unknown";
	const bundler = opts.bundler ?? "Bun / Vite";

	return `
<div class="rakta-dev-header">
  <img src="${opts.logoDataUrl}" alt="Rakta.js" />
  <span>Rakta.js</span>
  <span class="rakta-dev-version">v${opts.version}</span>
</div>
<div class="rakta-dev-section">
  <div class="rakta-dev-row">
    <span class="rakta-dev-label">Route</span>
    <span class="rakta-dev-value highlight" id="rd-route">${route}</span>
  </div>
  <div class="rakta-dev-row">
    <span class="rakta-dev-label">Rendering</span>
    <span class="rakta-dev-value" id="rd-mode">${mode.toUpperCase()}</span>
  </div>
  <div class="rakta-dev-row">
    <span class="rakta-dev-label">Bundler</span>
    <span class="rakta-dev-value">${bundler}</span>
  </div>
</div>
<div class="rakta-dev-section">
  <div class="rakta-dev-row clickable" id="rd-perf-toggle" role="button" tabindex="0"
       aria-expanded="false" aria-controls="rd-perf-content">
    <span class="rakta-dev-label">Performance</span>
    <span class="rakta-dev-arrow" id="rd-perf-arrow">›</span>
  </div>
  <div class="rakta-dev-perf" id="rd-perf-content" aria-live="polite">
    <div class="rakta-dev-perf-row">
      <span class="rakta-dev-perf-label">Network</span>
      <span class="rakta-dev-perf-val" id="rd-p-net">—</span>
    </div>
    <div class="rakta-dev-perf-row">
      <span class="rakta-dev-perf-label">Parse</span>
      <span class="rakta-dev-perf-val" id="rd-p-parse">—</span>
    </div>
    <div class="rakta-dev-perf-row">
      <span class="rakta-dev-perf-label">State</span>
      <span class="rakta-dev-perf-val" id="rd-p-state">—</span>
    </div>
    <div class="rakta-dev-perf-row">
      <span class="rakta-dev-perf-label">Render</span>
      <span class="rakta-dev-perf-val" id="rd-p-render">—</span>
    </div>
    <div class="rakta-dev-perf-row">
      <span class="rakta-dev-perf-label">Paint (FCP)</span>
      <span class="rakta-dev-perf-val" id="rd-p-paint">—</span>
    </div>
    <div class="rakta-dev-perf-row" style="border-top:1px solid #1c1c1c;margin-top:4px;padding-top:4px;">
      <span class="rakta-dev-perf-label" style="font-weight:600">Total</span>
      <span class="rakta-dev-perf-val" id="rd-p-total" style="font-weight:600">—</span>
    </div>
  </div>
</div>
<div class="rakta-dev-section">
  <div class="rakta-dev-row" id="rd-diag-row">
    <span class="rakta-dev-label">Diagnostics</span>
    <span class="rakta-dev-value" id="rd-diag-val" style="color:#22c55e">OK</span>
  </div>
</div>`;
}

// Mount ────────

/**
 * Mounts the Rakta Dev Indicator into the current document.
 * Called only in development mode from the client entry.
 *
 * Production builds never call this function because the import is guarded
 * by a `if (import.meta.env?.DEV || process.env.NODE_ENV === "development")`
 * check in the generated client entry source.
 */
export function mountDevIndicator(opts: DevIndicatorOptions): void {
	if (typeof document === "undefined") return;

	// Inject scoped styles
	const style = document.createElement("style");
	style.dataset.raktaDev = "";
	style.textContent = CSS;
	document.head.appendChild(style);

	// Root wrapper (shadow-root would be ideal but adds complexity — scoped
	// CSS class prefix is sufficient for a dev tool)
	const root = document.createElement("div");
	root.dataset.raktaDev = "";

	const btn = document.createElement("button");
	btn.id = "rakta-dev-btn";
	btn.setAttribute("aria-label", "Rakta.js Dev Tools");
	btn.setAttribute("aria-haspopup", "true");
	btn.setAttribute("aria-expanded", "false");
	btn.setAttribute("title", "Rakta.js Dev Tools");

	const logoImg = document.createElement("img");
	logoImg.src = opts.logoDataUrl;
	logoImg.alt = "Rakta.js";
	logoImg.setAttribute("aria-hidden", "true");
	btn.appendChild(logoImg);

	const panel = document.createElement("div");
	panel.id = "rakta-dev-panel";
	panel.setAttribute("role", "dialog");
	panel.setAttribute("aria-label", "Rakta.js Dev Tools panel");
	panel.innerHTML = buildPanelHtml(opts);

	root.appendChild(btn);
	root.appendChild(panel);
	document.body.appendChild(root);

	let isOpen = false;
	let perfOpen = false;

	function openPanel(): void {
		isOpen = true;
		panel.classList.add("open");
		btn.setAttribute("aria-expanded", "true");
		// Collect perf data on open so it reflects current page timing
		populatePerf();
		populateDiagnostics();
		// Focus first focusable element inside panel for a11y
		const firstFocus = panel.querySelector<HTMLElement>("[tabindex]");
		firstFocus?.focus();
	}

	function closePanel(): void {
		isOpen = false;
		panel.classList.remove("open");
		btn.setAttribute("aria-expanded", "false");
		btn.focus();
	}

	function togglePanel(): void {
		if (isOpen) closePanel();
		else openPanel();
	}

	function populatePerf(): void {
		const trace = collectPerfTrace();
		if (!trace) return;

		const set = (id: string, ms: number, slowThreshold = 500): void => {
			const el = document.getElementById(id);
			if (!el) return;
			if (ms <= 0) {
				el.textContent = "—";
				return;
			}
			el.textContent = ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
			el.className =
				"rakta-dev-perf-val" +
				(ms >= slowThreshold * 2
					? " bottleneck"
					: ms >= slowThreshold
						? " slow"
						: "");
		};

		set("rd-p-net", trace.networkMs, 1000);
		set("rd-p-parse", trace.parseMs, 200);
		set("rd-p-state", trace.stateMs, 100);
		set("rd-p-render", trace.renderMs, 200);
		set("rd-p-paint", trace.paintMs, 2000);
		set("rd-p-total", trace.totalMs, 3000);
	}

	// Highlight the "response in network but UI slow" case that was reported.

	function populateDiagnostics(): void {
		const diagVal = document.getElementById("rd-diag-val");
		if (!diagVal) return;

		const trace = collectPerfTrace();
		if (!trace) return;

		// Key indicator: large gap between network completion and FCP
		const responseToUiMs = trace.paintMs - trace.networkMs;

		if (responseToUiMs > 5000) {
			diagVal.textContent = `⚠ Response→UI gap: ${Math.round(responseToUiMs)}ms`;
			diagVal.style.color = "#ef4444";
		} else if (responseToUiMs > 1000) {
			diagVal.textContent = `⚠ Response→UI gap: ${Math.round(responseToUiMs)}ms`;
			diagVal.style.color = "#f59e0b";
		} else {
			diagVal.textContent = "OK";
			diagVal.style.color = "#22c55e";
		}
	}

	// Update route/mode info when navigation happens (SPA).

	function updateRouteInfo(): void {
		const routeEl = document.getElementById("rd-route");
		const modeEl = document.getElementById("rd-mode");
		if (routeEl) routeEl.textContent = location.pathname;
		if (modeEl) modeEl.textContent = (opts.renderMode ?? "CSR").toUpperCase();
	}

	const perfToggle = panel.querySelector<HTMLElement>("#rd-perf-toggle");
	const perfContent = panel.querySelector<HTMLElement>("#rd-perf-content");
	const perfArrow = panel.querySelector<HTMLElement>("#rd-perf-arrow");

	perfToggle?.addEventListener("click", () => {
		perfOpen = !perfOpen;
		perfContent?.classList.toggle("open", perfOpen);
		if (perfToggle) {
			perfToggle.setAttribute("aria-expanded", String(perfOpen));
		}
		if (perfArrow) perfArrow.textContent = perfOpen ? "⌃" : "›";
	});
	perfToggle?.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			perfToggle.click();
		}
	});

	btn.addEventListener("click", togglePanel);
	btn.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			togglePanel();
		}
	});

	document.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Escape" && isOpen) closePanel();
	});

	// Close on outside click
	document.addEventListener("click", (e: MouseEvent) => {
		if (isOpen && !root.contains(e.target as Node)) closePanel();
	});

	// SPA navigation listener
	const origPushState = history.pushState.bind(history);
	history.pushState = (...args) => {
		origPushState(...args);
		updateRouteInfo();
	};
	window.addEventListener("popstate", updateRouteInfo);

	// Initial route update
	updateRouteInfo();
}
