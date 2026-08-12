// Data fitur utama Rakta.js untuk ditampilkan di FeatureGrid
// Mendukung bilingual ID / EN dengan properti camelCase (id, en).

export interface RaktaFeature {
	id: string;
	title: string;
	desc: { id: string; en: string } | string;
	code: string;
}

export const raktaFeatures: readonly RaktaFeature[] = [
	{
		id: "megaweave",
		title: "MegaWeave",
		desc: {
			id: "File-based routing yang mengompilasi setiap route menjadi HTML node streaming dengan overhead nol.",
			en: "File-based routing that compiles every route into streaming HTML nodes with zero overhead.",
		},
		code: '<Click to="/dashboard">',
	},
	{
		id: "nagalimanwire",
		title: "NagaLimanWire",
		desc: {
			id: "RPC type-safe yang menghubungkan backend ke frontend. Panggil fungsi server seperti memanggil fungsi lokal.",
			en: "Type-safe RPC connecting backend to frontend. Call server functions as if they were local.",
		},
		code: "const data = await rpc.getUsers();",
	},
	{
		id: "trusmithread",
		title: "TrusmiThread",
		desc: {
			id: "Scanner auto-import yang menghasilkan deklarasi bertype untuk komponen, store, dan hooks - tanpa satu pun import manual.",
			en: "Auto-import scanner generating typed declarations for components, stores, and hooks - zero manual imports.",
		},
		code: "const [state, setState] = useState()",
	},
	{
		id: "panturascroll",
		title: "PanturaScroll",
		desc: {
			id: "Engine smooth scroll dan navigasi bagian halaman, dinamai dari Jalur Pantura, jalan pantai utara Jawa yang legendaris.",
			en: "Smooth scroll and in-page navigation engine, named after Jalur Pantura, Java's legendary north coast highway.",
		},
		code: '<Pantura to="section-id">',
	},
	{
		id: "sunyaragicrown",
		title: "SunyaragiCrown",
		desc: {
			id: "Manajer metadata dan head bawaan yang mengurus SEO, tag OpenGraph, dan URL canonical.",
			en: "Built-in metadata and head manager handling SEO, OpenGraph tags, and canonical URLs.",
		},
		code: "defineSeo({ title, description })",
	},
	{
		id: "shrimpharbor",
		title: "ShrimpHarbor",
		desc: {
			id: "Caching offline PWA, pembuatan manifest, dan kontrol siklus hidup service worker.",
			en: "Offline PWA caching, manifest generation, and service worker lifecycle control.",
		},
		code: "registerPwaWorker()",
	},
];
