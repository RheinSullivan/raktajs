// Data artikel untuk DocsModal (System Manual)
// Dipisah dari komponen supaya DocsModal.tsx hanya bertugas render dan navigasi.

export interface Article {
	id: string;
	title: string;
	category: string;
	content: string;
}

export const ARTICLES: Article[] = [
	{
		id: "intro",
		title: "1. Apa itu Rakta.js?",
		category: "Mulai dari Sini",
		content: `Rakta.js adalah framework React ringan yang dibangun di atas Bun dan TypeScript. Dirancang untuk developer yang ingin kecepatan tanpa setup yang menyulitkan.

Framework ini menyatukan routing berbasis file, auto-import tanpa pernyataan import manual, RPC type-safe, dan autentikasi bawaan ke dalam satu paket yang siap produksi.

### Arsitektur Inti
- **Boot Cepat**: Waktu muat server di bawah 1ms pada kondisi cold-start.
- **HTML Murni**: Tidak ada runtime polyfill yang tidak perlu.
- **Port Langsung**: Pemetaan Port-3000 untuk sandbox lokal dengan latensi rendah.

### Cara Mulai
\`\`\`bash
# Install CLI Rakta
npm install -g @rakta/cli

# Jalankan mode development
rakta dev --port 3000
\`\`\``,
	},
	{
		id: "opt",
		title: "2. Optimasi Performa",
		category: "Performa",
		content: `ShrimpRun di halaman ini berjalan di 144 FPS karena Rakta menghindari re-render React yang tidak perlu.

### Cara ShrimpRun Bekerja
- **RequestAnimationFrame**: Fisika game disinkronkan langsung ke refresh monitor, bukan ke siklus render React.
- **Physics Loop Tanpa Alokasi**: Posisi obstacle dan state game disimpan di ref tetap , tidak ada objek baru yang dibuat setiap frame.
- **Low Latency Mode**: Beralih dari gradient ke layout SVG langsung, menghemat sekitar 40% siklus CPU di perangkat lama.

### Contoh Loop Efisien
\`\`\`typescript
// Tick frame yang efisien
function tick(timestamp: number) {
  const delta = timestamp - lastFrame;
  updatePhysics(delta); // Mutasi ref secara langsung
  requestAnimationFrame(tick);
}
\`\`\``,
	},
	{
		id: "styling",
		title: "3. Gaya Visual Neo-Brutalist",
		category: "Desain & Gaya",
		content: `Rakta menggunakan filosofi desain Neo-Brutalism , kontras tinggi, border tajam, tidak ada sudut bulat, dan hierarki tipografi yang jelas.

### Prinsip Visual
1. **True Black (#000000)**: Hindari abu-abu keruh kecuali untuk state grid.
2. **Aksen Utama (Rose-600)**: Hanya untuk aksi, highlight, dan state kritis.
3. **JetBrains Mono**: Untuk angka, laporan state, dan log terminal.
4. **Border Tajam**: Tidak ada border-radius pada elemen utama.

### Resep Tailwind untuk Card
\`\`\`html
<div class="border border-white hover:bg-white hover:text-black transition-colors p-8">
  <span class="font-mono text-xs text-rose-500">01</span>
  <h3 class="text-2xl font-bold uppercase">MODULE</h3>
</div>
\`\`\``,
	},
	{
		id: "cli",
		title: "4. CLI & Deployment",
		category: "Deployment",
		content: `Aplikasi Rakta dikompilasi menjadi satu aset server tunggal yang siap jalan.

### Build & Packaging
Script build menggunakan esbuild dengan target \`node22\`, menghasilkan file CJS di \`dist/server.cjs\` tanpa dependensi eksternal.

### Deploy ke Edge
Deployment mendorong paket terkompilasi ke container serverless regional yang langsung terhubung ke cache edge berlatensi rendah.

### Perintah Deploy
\`\`\`bash
# Kompilasi dan buat aset produksi
npm run build

# Jalankan server produksi
npm start
\`\`\``,
	},
] as const;
