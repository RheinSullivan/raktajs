// Data log deployment simulasi untuk DeployModal
// Dipisah dari komponen supaya DeployModal.tsx fokus pada UI dan interaksi.

export type DeployLogType = "system" | "info" | "success";

export interface DeployLog {
	readonly text: string;
	readonly type: DeployLogType;
}

export const DEPLOY_LOGS: readonly DeployLog[] = [
	{ text: ":: RAKTA CORE PIPELINE INITIALIZED ::", type: "system" },
	{
		text: "[SYS] Membaca package.json dan resolving dependensi...",
		type: "info",
	},
	{
		text: "[SYS] Runtime terdeteksi: Node.js (>=22.0.0), Vite (^6.2.3)",
		type: "info",
	},
	{
		text: "[VITE] Memulai kompilasi aset dan pengecekan TypeScript...",
		type: "info",
	},
	{
		text: "[VITE] Merender struktur HTML statis halaman tunggal...",
		type: "info",
	},
	{
		text: '[VITE] Memproses @import "tailwindcss" di stylesheet...',
		type: "info",
	},
	{
		text: "[VITE] ✓ Folder dist/ produksi berhasil dibuat [384ms]",
		type: "success",
	},
	{
		text: "[ESBUILD] Mengompilasi entrypoint backend: server.ts",
		type: "info",
	},
	{
		text: "[ESBUILD] Bundling dengan flag --platform=node --format=cjs --packages=external",
		type: "info",
	},
	{ text: "[ESBUILD] ✓ server.ts → dist/server.cjs [120ms]", type: "success" },
	{ text: "[DOCKER] Membangun container deployment...", type: "info" },
	{
		text: "[DOCKER] Membersihkan devDependencies non-produksi dari image...",
		type: "info",
	},
	{ text: "[DOCKER] ✓ Image terkompresi: 14.12 MB [220ms]", type: "success" },
	{
		text: "[CLOUD RUN] Mengirim paket build ke edge registry regional...",
		type: "info",
	},
	{
		text: "[CLOUD RUN] Membuat revision deployment untuk region: asia-southeast1",
		type: "info",
	},
	{
		text: "[CLOUD RUN] Ingress dikonfigurasi: semua traffic diarahkan ke Port 3000",
		type: "info",
	},
	{ text: "[CLOUD RUN] Menyiapkan sandbox serverless...", type: "info" },
	{ text: "[DNS] Mengarahkan routing global ke Edge API URL...", type: "info" },
	{ text: ":: DEPLOYMENT SELESAI DI SEMUA EDGE NODE ::", type: "success" },
] as const;

/**
 * Kembalikan class warna teks berdasarkan tipe log.
 */
export function getLogTextClass(type: DeployLogType): string {
	if (type === "system")
		return "text-brand-pink font-bold border-b border-brand-pink/20 pb-1 mb-2";
	if (type === "success") return "text-brand-green font-bold";
	return "text-gray-300";
}
