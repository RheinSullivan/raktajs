// Data fitur utama Rakta.js untuk ditampilkan di FeatureGrid
// Dipisah dari komponen supaya FeatureGrid.tsx hanya bertugas render.

export interface RaktaFeature {
	id: string;
	title: string;
	desc: string;
	code: string;
}

export const RAKTA_FEATURES: RaktaFeature[] = [
	{
		id: "megaweave",
		title: "MegaWeave",
		desc: "File-based routing yang mengompilasi setiap route menjadi HTML node streaming dengan overhead nol.",
		code: '<click to="/dashboard">',
	},
	{
		id: "nagalimanwire",
		title: "NagaLimanWire",
		desc: "RPC type-safe yang menghubungkan backend ke frontend. Panggil fungsi server seperti memanggil fungsi lokal.",
		code: "const data = await rpc.getUsers();",
	},
	{
		id: "trusmithread",
		title: "TrusmiThread",
		desc: "Scanner auto-import yang menghasilkan deklarasi bertype untuk komponen, store, dan hooks , tanpa satu pun import manual.",
		code: "const [state, setState] = useState()",
	},
	{
		id: "panturascroll",
		title: "PanturaScroll",
		desc: "Engine smooth scroll dan navigasi bagian halaman, dinamai dari Jalur Pantura, jalan pantai utara Jawa yang legendaris.",
		code: '<pantura to="section-id">',
	},
	{
		id: "sunyaragicrown",
		title: "SunyaragiCrown",
		desc: "Manajer metadata dan head bawaan yang mengurus SEO, tag OpenGraph, dan URL canonical.",
		code: "defineSeo({ title, description })",
	},
	{
		id: "shrimpharbor",
		title: "ShrimpHarbor",
		desc: "Caching offline PWA, pembuatan manifest, dan kontrol siklus hidup service worker.",
		code: "registerPwaWorker()",
	},
] as const;
