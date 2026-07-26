// Data komponen demo untuk ComponentsModal (Component Library)
// Dipisah dari komponen supaya ComponentsModal.tsx fokus pada UI dan interaksi.
// NOTE: Preview functions pakai JSX , pastikan file ini diproses sebagai .tsx jika perlu JSX.

import type { ReactNode } from "react";

export interface ComponentItem {
	id: string;
	name: string;
	description: string;
	preview: (
		state: Record<string, unknown>,
		setState: (s: Record<string, unknown>) => void,
	) => ReactNode;
	code: string;
}

// Data ini dipakai di ComponentsModal , preview function berisi JSX
// sehingga tetap berada di sini sebagai data, bukan inline di komponen.
export const COMPONENT_IDS = [
	"button",
	"badge",
	"switch",
	"slider",
	"input",
] as const;

export type ComponentId = (typeof COMPONENT_IDS)[number];

export const COMPONENT_METADATA: Record<
	ComponentId,
	{ name: string; description: string; code: string }
> = {
	button: {
		name: "Brutalist Button",
		description:
			"Tombol aksi kontras tinggi dengan border mentah dan scaling aktif.",
		code: `<button class="bg-rose-600 hover:bg-white text-white hover:text-black px-6 py-3 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent hover:border-black active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
  TRIGGER PIPELINE
</button>`,
	},
	badge: {
		name: "Performance Badge",
		description:
			"Badge mono visibilitas tinggi dengan indikator status live yang berdenyut.",
		code: `<div class="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 font-mono text-xs text-emerald-400">
  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
  OPERATIONAL :: 100%
</div>`,
	},
	switch: {
		name: "Monochrome Toggle",
		description: "Switch persegi yang membalik state dengan umpan balik audio.",
		code: `<button class="flex items-center border border-white p-1 w-16 h-8 bg-zinc-900">
  <div class="w-6 h-6 bg-white transition-all transform translate-x-8"></div>
</button>`,
	},
	slider: {
		name: "Frequency Slider",
		description: "Pengatur level bergaya piksel dengan visual bertingkat.",
		code: `<div class="w-full max-w-xs font-mono">
  <input type="range" class="accent-rose-600 bg-zinc-800 h-2 w-full border border-zinc-700 appearance-none cursor-pointer" />
</div>`,
	},
	input: {
		name: "Brutalist Input",
		description:
			"Kotak teks minimalis dengan indikator fokus validasi yang cerah.",
		code: `<div class="relative font-mono">
  <input type="text" placeholder="MASUKKAN NAMA NODE..." class="bg-black border border-zinc-700 focus:border-rose-600 text-white px-4 py-2 w-full outline-none" />
</div>`,
	},
} as const;
