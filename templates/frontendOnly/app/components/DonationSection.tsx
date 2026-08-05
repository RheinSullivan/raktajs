// biome-ignore-all lint: Template welcome starter Rakta.js
// NOTE: Rakta.js Auto Import — tidak perlu import manual.

const donationCopyData = {
	id: {
		badge: "OPEN SOURCE · KOMITMEN KEMANUSIAAN",
		heading: "Donasi & Dukungan Kemanusiaan",
		subheading: "Donations & Humanitarian Support",
		desc: "Rakta.js dibangun dengan nurani. Setiap kontribusi mendukung framework sekaligus kehidupan nyata manusia. Minimal 70% dari semua donasi langsung disalurkan ke bantuan kemanusiaan.",
		descEn:
			"Built with conscience. At least 70% of all donations go directly to humanitarian causes worldwide.",
		card1Title: "Bantuan Kaum Dhuafa",
		card1Sub: "Kesejahteraan Sosial Lokal",
		card2Title: "Bantuan Kemanusiaan untuk Palestina",
		card2Sub: "Bantuan Darurat Global",
		card3Title: "Transparansi Keuangan 100%",
		card3Sub: "Laporan Publik Setiap Bulan",
		card1Desc:
			"Menyediakan bantuan pangan, beasiswa pendidikan, dan layanan kesehatan bagi keluarga kurang mampu, anak yatim, dan lansia di seluruh komunitas Indonesia.",
		card2Desc:
			"Menyalurkan perlengkapan medis, tempat berlindung darurat, air bersih, dan paket bantuan untuk keluarga yang terdampak di Palestina melalui organisasi kemanusiaan terpercaya.",
		card3Desc:
			"Setiap rupiah dilaporkan secara publik setiap bulan. Bukti transfer dan distribusi selalu di-upload ke repositori. Tidak ada pemotongan untuk kepentingan pribadi.",
		ctaDonate: "Donasi Sekarang",
		ctaReport: "Laporan Transparansi",
		ctaTag: "Bebas Palestina · Rakta.js berdiri bersama kemanusiaan",
		transparency: "Maks. 30% biaya operasional framework",
	},
	en: {
		badge: "OPEN SOURCE · HUMANITARIAN COMMITMENT",
		heading: "Humanitarian Support",
		subheading: "Donations & Humanitarian Support",
		desc: "Rakta.js is built with conscience. Every contribution supports both the framework and real human lives. At least 70% of all donations go directly to humanitarian causes.",
		descEn:
			"Dibangun dengan nurani. Minimal 70% donasi langsung disalurkan ke bantuan kemanusiaan.",
		card1Title: "Support for Kaum Dhuafa",
		card1Sub: "Local Social Welfare",
		card2Title: "Humanitarian Aid for Palestine",
		card2Sub: "Global Emergency Relief",
		card3Title: "100% Financial Transparency",
		card3Sub: "Monthly Public Reports",
		card1Desc:
			"Providing food assistance, education grants, and healthcare aid for the underprivileged, orphans, and elderly across communities in Indonesia.",
		card2Desc:
			"Delivering medical supplies, emergency shelter, clean water, and relief kits to affected families in Palestine through trusted humanitarian organizations.",
		card3Desc:
			"Every rupiah is publicly reported monthly. Transfer receipts and distribution proofs are always uploaded to the repository. Zero personal deductions.",
		ctaDonate: "Donate Now",
		ctaReport: "Transparency Report",
		ctaTag: "Free Palestine · Rakta.js stands with humanity",
		transparency: "Max. 30% framework operational costs",
	},
} as const;

function getDonationCards(langKey: "id" | "en") {
	const currentCopy = donationCopyData[langKey];
	return [
		{
			id: "duafa",
			icon: "🤲",
			title: currentCopy.card1Title,
			subtitle: currentCopy.card1Sub,
			subtitleClass: "text-brand-pink",
			borderHover: "hover:border-brand-pink",
			desc: currentCopy.card1Desc,
		},
		{
			id: "palestine",
			icon: "🇵🇸",
			title: currentCopy.card2Title,
			subtitle: currentCopy.card2Sub,
			subtitleClass: "text-emerald-400",
			borderHover: "hover:border-emerald-500",
			desc: currentCopy.card2Desc,
		},
		{
			id: "transparency",
			icon: "📋",
			title: currentCopy.card3Title,
			subtitle: currentCopy.card3Sub,
			subtitleClass: "text-sky-400",
			borderHover: "hover:border-sky-500",
			desc: currentCopy.card3Desc,
		},
	];
}

export default function DonationSection({ lang }: { lang: "ID" | "EN" }) {
	const langKey = lang.toLowerCase() as "id" | "en";
	const currentCopy = donationCopyData[langKey];
	const cardsList = getDonationCards(langKey);

	return (
		<section
			className="border-t border-surface-stroke bg-black px-4 py-16 sm:px-6"
			id="donation"
		>
			<div className="mx-auto max-w-6xl">
				{/* Section Header */}
				<div className="mb-10 flex flex-col items-center gap-3 text-center">
					<div className="inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-[10px] text-brand-pink uppercase tracking-widest">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
						{currentCopy.badge}
					</div>
					<h2 className="font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
						Donations &amp;{" "}
						<span className="text-brand-pink">{currentCopy.heading}</span>
					</h2>
					<p className="max-w-2xl font-mono text-xs leading-relaxed text-gray-400">
						{currentCopy.desc}
					</p>
					<p className="max-w-2xl font-mono text-[10px] leading-relaxed text-gray-600">
						{currentCopy.descEn}
					</p>
				</div>

				{/* Feature Cards */}
				<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
					{cardsList.map((item) => (
						<div
							key={item.id}
							className={`border border-surface-stroke bg-[#080808] p-6 transition-colors ${item.borderHover}`}
						>
							<div className="mb-3 text-2xl">{item.icon}</div>
							<h3 className="mb-1 font-mono text-xs font-bold uppercase text-brand-pink">
								{item.title}
							</h3>
							<p
								className={`mb-3 font-mono text-[10px] font-semibold uppercase ${item.subtitleClass}`}
							>
								{item.subtitle}
							</p>
							<p className="font-mono text-[11px] leading-relaxed text-gray-300">
								{item.desc}
							</p>
						</div>
					))}
				</div>

				{/* CTA Row */}
				<div className="flex flex-col items-center gap-4 border border-surface-stroke bg-[#060606] p-6 sm:flex-row sm:justify-between">
					<div>
						<p className="font-mono text-sm font-bold uppercase text-white">
							{langKey === "id"
								? "Dukung Rakta.js & Bantuan Kemanusiaan"
								: "Support Rakta.js & Humanitarian Aid"}
						</p>
						<p className="mt-1 font-mono text-[10px] text-gray-500">
							buymeacoffee.com/rheinsullivan · {currentCopy.transparency}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<a
							href="https://buymeacoffee.com/rheinsullivan"
							target="_blank"
							rel="noopener noreferrer"
							className="border-2 border-brand-pink bg-brand-pink px-6 py-2.5 font-mono text-[11px] font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)] transition-all hover:bg-white hover:text-black"
						>
							{currentCopy.ctaDonate}
						</a>
						<a
							href="https://github.com/RheinSullivan/raktajs/blob/main/docs/en/donations.md"
							target="_blank"
							rel="noopener noreferrer"
							className="border border-surface-stroke bg-black px-6 py-2.5 font-mono text-[11px] font-bold uppercase text-gray-300 transition-all hover:border-white hover:text-white"
						>
							{currentCopy.ctaReport}
						</a>
					</div>
				</div>

				{/* Palestine Banner */}
				<div className="mt-4 flex items-center justify-center gap-3 border border-green-900/40 bg-green-950/10 px-4 py-3 font-mono text-[10px] text-green-400">
					<span>🇵🇸</span>
					<span className="font-bold uppercase tracking-widest">
						{currentCopy.ctaTag}
					</span>
					<span>🇵🇸</span>
				</div>
			</div>
		</section>
	);
}
