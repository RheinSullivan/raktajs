// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.

import { motion } from "motion/react";
import React, { useState } from "react";
import {
	LuCheck as Check,
	LuCode as Code,
	LuCopy as Copy,
	LuCpu as Cpu,
	LuX as X,
} from "react-icons/lu";
import { playJumpSound, playScoreSound } from "../utils/audio";

interface ComponentsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ComponentItem {
	id: string;
	name: string;
	description: string;
	preview: (state: any, setState: any) => React.ReactNode;
	code: string;
}

const BRUTALIST_COMPONENTS: ComponentItem[] = [
	{
		id: "button",
		name: "Brutalist Button",
		description:
			"A solid, high-contrast action trigger with raw borders and active scaling.",
		code: `<button class="bg-rose-600 hover:bg-white text-white hover:text-black px-6 py-3 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent hover:border-black active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)]">
  TRIGGER PIPELINE
</button>`,
		preview: (state, setState) => (
			<button
				onClick={() => {
					playJumpSound();
					setState({ ...state, clickCount: (state.clickCount || 0) + 1 });
				}}
				className="bg-brand-pink hover:bg-white text-white hover:text-black px-6 py-3 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent hover:border-black active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.25)] cursor-pointer"
			>
				TRIGGER PIPELINE ({state.clickCount || 0})
			</button>
		),
	},
	{
		id: "badge",
		name: "Performance Badge",
		description:
			"A high-visibility mono badge with a pulsing live status indicator.",
		code: `<div class="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 font-mono text-xs text-emerald-400">
  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
  OPERATIONAL :: 100%
</div>`,
		preview: (state, setState) => (
			<div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 font-mono text-xs text-emerald-400">
				<span className="relative flex h-2 w-2">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				OPERATIONAL :: 100%
			</div>
		),
	},
	{
		id: "switch",
		name: "Monochrome Toggle",
		description:
			"A structural, rectangular switch that flips states with tactile audio feedback.",
		code: `<button class="flex items-center border border-white p-1 w-16 h-8 bg-zinc-900">
  <div class="w-6 h-6 bg-white transition-all transform translate-x-8"></div>
</button>`,
		preview: (state, setState) => {
			const isChecked = state.isChecked ?? false;
			const handleToggle = () => {
				playScoreSound();
				setState({ ...state, isChecked: !isChecked });
			};
			return (
				<div className="flex items-center gap-4">
					<button
						onClick={handleToggle}
						className={`flex items-center border-2 border-white p-0.5 w-16 h-8 transition-colors cursor-pointer ${isChecked ? "bg-brand-pink" : "bg-zinc-900"}`}
					>
						<div
							className={`w-6 h-6 bg-white transition-transform ${isChecked ? "translate-x-8" : "translate-x-0"}`}
						></div>
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
	},
	{
		id: "slider",
		name: "Frequency Slider",
		description: "A pixelated level adjuster with raw visual increments.",
		code: `<div class="w-full max-w-xs font-mono">
  <input type="range" class="accent-rose-600 bg-zinc-800 h-2 w-full border border-zinc-700 appearance-none cursor-pointer" />
</div>`,
		preview: (state, setState) => {
			const value = state.sliderVal ?? 60;
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
						<span>MID_GRID</span>
						<span>MAX</span>
					</div>
				</div>
			);
		},
	},
	{
		id: "input",
		name: "Brutalist Input",
		description: "Minimal text box with bright validation focus indicators.",
		code: `<div class="relative font-mono">
  <input type="text" placeholder="ENTER NODE NAME..." class="bg-black border border-zinc-700 focus:border-rose-600 text-white px-4 py-2 w-full outline-none" />
</div>`,
		preview: (state, setState) => {
			const text = state.inputValue ?? "";
			return (
				<div className="w-full max-w-xs font-mono text-xs">
					<label className="block text-gray-500 uppercase mb-1.5">
						Node Configuration
					</label>
					<input
						type="text"
						placeholder="ENTER NODE NAME..."
						value={text}
						onChange={(e) => setState({ ...state, inputValue: e.target.value })}
						className="bg-black border border-zinc-700 focus:border-brand-pink text-white px-4 py-2 w-full outline-none"
					/>
					{text && (
						<p className="text-[10px] text-brand-green mt-1">
							✓ Validating: {text.toUpperCase()}.local
						</p>
					)}
				</div>
			);
		},
	},
];

export default function ComponentsModal({
	isOpen,
	onClose,
}: ComponentsModalProps) {
	const [activeCompId, setActiveCompId] = useState("button");
	const [componentStates, setComponentStates] = useState<Record<string, any>>(
		{},
	);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	if (!isOpen) return null;

	const activeComp =
		BRUTALIST_COMPONENTS.find((c) => c.id === activeCompId) ||
		BRUTALIST_COMPONENTS[0];
	const activeState = componentStates[activeCompId] || {};

	const handleSetState = (newState: any) => {
		setComponentStates({
			...componentStates,
			[activeCompId]: newState,
		});
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
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 15 }}
				transition={{ duration: 0.2 }}
				className="w-full max-w-4xl h-[75vh] bg-black border-2 border-white flex flex-col relative"
			>
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
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Layout */}
				<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
					{/* Sidebar */}
					<div className="w-full md:w-56 border-r border-surface-stroke overflow-y-auto bg-[#080808] divide-y divide-surface-stroke">
						{BRUTALIST_COMPONENTS.map((comp) => {
							const isSelected = comp.id === activeCompId;
							return (
								<button
									key={comp.id}
									onClick={() => setActiveCompId(comp.id)}
									className={`w-full text-left p-4 transition-colors font-mono text-xs uppercase cursor-pointer ${
										isSelected
											? "bg-brand-pink text-white font-bold"
											: "text-gray-400 hover:bg-white/5 hover:text-white"
									}`}
								>
									{comp.name}
								</button>
							);
						})}
					</div>

					{/* Canvas & Code Area */}
					<div className="flex-1 flex flex-col overflow-y-auto bg-black p-6 md:p-8">
						<div className="mb-6">
							<h3 className="text-xl font-bold text-white uppercase font-mono tracking-tight">
								{activeComp.name}
							</h3>
							<p className="text-sm text-gray-400 mt-1">
								{activeComp.description}
							</p>
						</div>

						{/* Live Preview Canvas */}
						<div className="border border-surface-stroke bg-[#050505] bg-grid-glow p-12 flex items-center justify-center min-h-[160px] relative">
							<span className="absolute top-2 left-2 text-[8px] font-mono text-gray-600 uppercase tracking-widest">
								LIVE PLAYGROUND
							</span>
							{activeComp.preview(activeState, handleSetState)}
						</div>

						{/* Code Output */}
						<div className="mt-8 flex-1 flex flex-col min-h-[150px]">
							<div className="flex items-center justify-between bg-surface-card border-t border-x border-surface-stroke px-4 py-2">
								<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
									<Code className="w-3.5 h-3.5" /> HTML/Tailwind Markup
								</span>
								<button
									onClick={() => handleCopyCode(activeComp.code)}
									className="flex items-center gap-1.5 text-[10px] font-mono text-brand-pink hover:text-white transition-colors cursor-pointer"
								>
									{copiedId === activeComp.id ? (
										<>
											<Check className="w-3.5 h-3.5 text-brand-green" /> COPIED!
										</>
									) : (
										<>
											<Copy className="w-3.5 h-3.5" /> COPY TO CLIPBOARD
										</>
									)}
								</button>
							</div>
							<pre className="flex-1 bg-surface-card border border-surface-stroke p-4 font-mono text-xs text-brand-green overflow-x-auto whitespace-pre leading-5 select-all">
								<code>{activeComp.code}</code>
							</pre>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
