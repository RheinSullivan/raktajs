export default function DonationSection() {
	return (
		<section className="border-b border-surface-stroke bg-[#080808] py-16 px-4 sm:px-6">
			<div className="mx-auto max-w-5xl text-center">
				<div className="mb-4 inline-flex items-center gap-2 border border-brand-pink/30 bg-rose-950/20 px-3 py-1 font-mono text-xs text-brand-pink">
					<Heart className="h-3 w-3 text-brand-pink" />
					DONATIONS & HUMANITARIAN SUPPORT
				</div>

				<h2 className="font-mono text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
					Donations &{" "}
					<span className="text-brand-pink">Humanitarian Support</span>
				</h2>

				<p className="mx-auto mt-4 max-w-2xl font-mono text-xs text-gray-400 leading-relaxed">
					Rakta.js is committed to social responsibility and global solidarity.
					We actively direct support and resources to humanitarian causes
					worldwide.
				</p>

				<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
					<div className="border border-surface-stroke bg-black p-6 hover:border-brand-pink transition-colors">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-10 w-10 items-center justify-center border border-brand-pink bg-rose-950/30 text-brand-pink">
								<Heart className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-mono text-sm font-bold uppercase text-white">
									Support for Kaum Duafa
								</h3>
								<span className="font-mono text-[10px] text-gray-500 uppercase">
									Local Social Welfare
								</span>
							</div>
						</div>
						<p className="font-mono text-xs text-gray-300 leading-relaxed">
							Providing food assistance, education grants, and healthcare aid
							for the underprivileged and orphans across local communities in
							Indonesia.
						</p>
					</div>

					<div className="border border-surface-stroke bg-black p-6 hover:border-emerald-500 transition-colors">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-10 w-10 items-center justify-center border border-emerald-500 bg-emerald-950/30 text-emerald-400">
								<Heart className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-mono text-sm font-bold uppercase text-white">
									Humanitarian Aid for Palestine
								</h3>
								<span className="font-mono text-[10px] text-emerald-400 uppercase">
									Global Emergency Relief
								</span>
							</div>
						</div>
						<p className="font-mono text-xs text-gray-300 leading-relaxed">
							Delivering medical supplies, emergency shelter, clean water, and
							relief kits to affected families in Palestine through trusted
							humanitarian organizations.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
