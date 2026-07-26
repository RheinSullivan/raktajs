// biome-ignore-all lint: Template welcome starter Rakta.js , cerminan desain resmi.
// biome-ignore-all assist: Template welcome starter Rakta.js , cerminan desain resmi.
// NOTE: useState di-auto-import oleh Rakta.js.
//
// Catatan arsitektur:
// - Metadata komponen (name, description, code) ada di app/lib/componentData.ts
// - Preview function (JSX interaktif) tetap di sini karena butuh JSX transform

import { COMPONENT_IDS, COMPONENT_METADATA } from "../lib/componentData";

interface ComponentsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// Preview functions , dipisah dari metadata tapi tetap di file .tsx karena pakai JSX
const COMPONENT_PREVIEWS: Record<
	string,
	(
		state: Record<string, unknown>,
		setState: (s: Record<string, unknown>) => void,
	) => ReactNode
> = {
	button: (state, setState) => (
		<button
			onClick={() => {
				playJumpSound();
				setState({
					...state,
					clickCount: ((state.clickCount as number) || 0) + 1,
				});
			}}
			className="bg-brand-pink hover:bg-white text-white hover:text-black px-6 py-3 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent hover:border-black active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] cursor-pointer"
		>
			TRIGGER PIPELINE ({(state.clickCount as number) || 0})
		</button>
	),

	badge: (_state, _setState) => (
		<div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 font-mono text-xs text-emerald-400">
			<span className="relative flex h-2 w-2">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
				<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
			</span>
			OPERATIONAL :: 100%
		</div>
	),

	switch: (state, setState) => {
		const isChecked = (state.isChecked as boolean) ?? false;
		return (
			<div className="flex items-center gap-4">
				<button
					onClick={() => {
						playScoreSound();
						setState({ ...state, isChecked: !isChecked });
					}}
					className={`flex items-center border-2 border-white p-0.5 w-16 h-8 transition-colors cursor-pointer ${isChecked ? "bg-brand-pink" : "bg-zinc-900"}`}
				>
					<div
						className={`w-6 h-6 bg-white transition-transform ${isChecked ? "translate-x-8" : "translate-x-0"}`}
					/>
				</button>
				<span className="font-mono text-xs uppercase text-gray-400">
					STATE:{" "}
					<span className="text-white font-bold">
						{isChecked ? "ENABLED" : "DISABLED"}
					</span>
				</span>
			</div>
		);
	},

	slider: (state, setState) => {
		const value = (state.sliderVal as number) ?? 60;
		return (
			<div className="w-full max-w-sm font-mono text-xs">
				<div className="flex justify-between mb-2">
					<span className="text-gray-400 uppercase">SYS_SPEED</span>
					<span className="text-brand-green font-bold">{value} MHz</span>
				</div>
				<input
					type="range"
					min="10"
					max="200"
					value={value}
					onChange={(e) =>
						setState({ ...state, sliderVal: parseInt(e.target.value) })
					}
					className="accent-brand-pink bg-zinc-900 h-2 w-full border border-zinc-700 appearance-none cursor-pointer"
				/>
				<div className="flex justify-between mt-1 text-[9px] text-gray-600">
					<span>MIN</span>
					<span>TENGAH</span>
					<span>MAX</span>
				</div>
			</div>
		);
	},

	input: (state, setState) => {
		const text = (state.inputValue as string) ?? "";
		return (
			<div className="w-full max-w-xs font-mono text-xs">
				<label className="block text-gray-500 uppercase mb-1.5">
					Konfigurasi Node
				</label>
				<input
					type="text"
					placeholder="MASUKKAN NAMA NODE..."
					value={text}
					onChange={(e) => setState({ ...state, inputValue: e.target.value })}
					className="bg-black border border-zinc-700 focus:border-brand-pink text-white px-4 py-2 w-full outline-none"
				/>
				{text && (
					<p className="text-[10px] text-brand-green mt-1">
						✓ Validasi: {text.toUpperCase()}.local
					</p>
				)}
			</div>
		);
	},
};

export default function ComponentsModal({
	isOpen,
	onClose,
}: ComponentsModalProps) {
	const [activeCompId, setActiveCompId] = useState<string>(COMPONENT_IDS[0]);
	const [componentStates, setComponentStates] = useState<
		Record<string, Record<string, unknown>>
	>({});
	const [copiedId, setCopiedId] = useState<string | null>(null);

	if (!isOpen) return null;

	const activeMeta =
		COMPONENT_METADATA[activeCompId as keyof typeof COMPONENT_METADATA] ??
		COMPONENT_METADATA[COMPONENT_IDS[0]];
	const activePreview =
		COMPONENT_PREVIEWS[activeCompId] ?? COMPONENT_PREVIEWS[COMPONENT_IDS[0]];
	const activeState = componentStates[activeCompId] ?? {};

	const handleSetState = (newState: Record<string, unknown>) => {
		setComponentStates({ ...componentStates, [activeCompId]: newState });
	};

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedId(activeCompId);
		setTimeout(() => setCopiedId(null), 2000);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
			id="components-modal-container"
		>
			<div className="w-full max-w-4xl h-[75vh] bg-black border-2 border-white flex flex-col relative">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<Cpu className="w-5 h-5 text-brand-pink" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta <span className="text-brand-pink">Component Library</span>
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						id="close-components-btn"
						aria-label="Tutup modal komponen"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Layout utama */}
				<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
					{/* Sidebar navigasi */}
					<div className="w-full md:w-56 border-r border-surface-stroke overflow-y-auto bg-[#080808] divide-y divide-surface-stroke">
						{COMPONENT_IDS.map((id) => {
							const meta = COMPONENT_METADATA[id];
							const isSelected = id === activeCompId;
							return (
								<button
									key={id}
									onClick={() => setActiveCompId(id)}
									className={`w-full text-left p-4 transition-colors font-mono text-xs uppercase cursor-pointer ${
										isSelected
											? "bg-brand-pink text-white font-bold"
											: "text-gray-400 hover:bg-white/5 hover:text-white"
									}`}
								>
									{meta.name}
								</button>
							);
						})}
					</div>

					{/* Area preview dan kode */}
					<div className="flex-1 flex flex-col overflow-y-auto bg-black p-6 md:p-8">
						<div className="mb-6">
							<h3 className="text-xl font-bold text-white uppercase font-mono tracking-tight">
								{activeMeta.name}
							</h3>
							<p className="text-sm text-gray-400 mt-1">
								{activeMeta.description}
							</p>
						</div>

						{/* Preview interaktif */}
						<div className="border border-surface-stroke bg-[#050505] bg-grid-glow p-12 flex items-center justify-center min-h-[160px] relative">
							<span className="absolute top-2 left-2 text-[8px] font-mono text-gray-600 uppercase tracking-widest">
								LIVE PLAYGROUND
							</span>
							{activePreview(activeState, handleSetState)}
						</div>

						{/* Output kode */}
						<div className="mt-8 flex-1 flex flex-col min-h-[150px]">
							<div className="flex items-center justify-between bg-surface-card border-t border-x border-surface-stroke px-4 py-2">
								<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
									<Code className="w-3.5 h-3.5" /> HTML/Tailwind Markup
								</span>
								<button
									onClick={() => handleCopyCode(activeMeta.code)}
									className="flex items-center gap-1.5 text-[10px] font-mono text-brand-pink hover:text-white transition-colors cursor-pointer"
								>
									{copiedId === activeCompId ? (
										<>
											<Check className="w-3.5 h-3.5 text-brand-green" />{" "}
											TERSALIN!
										</>
									) : (
										<>
											<Copy className="w-3.5 h-3.5" /> SALIN KODE
										</>
									)}
								</button>
							</div>
							<pre className="flex-1 bg-surface-card border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre leading-5 select-all">
								<code>{activeMeta.code}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
