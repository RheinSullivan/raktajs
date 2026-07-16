// biome-ignore-all lint: Generated Rakta.js welcome starter mirrors the source design.
// biome-ignore-all assist: Generated Rakta.js welcome starter mirrors the source design.
// NOTE: React hooks (useState, useEffect, useRef) are auto-imported by Rakta.js.
import { motion } from "motion/react";
import {
	LuCircleCheck as CheckCircle2,
	LuCloud as Cloud,
	LuPlay as Play,
	LuRotateCcw as RotateCcw,
	LuX as X,
} from "react-icons/lu";
import { playScoreSound } from "../utils/audio";

interface DeployModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface DeployLog {
	readonly text: string;
	readonly type: "system" | "info" | "success";
}

const DEPLOY_LOGS: readonly DeployLog[] = [
	{ text: ":: RAKTA CORE PIPELINE INITIALIZED ::", type: "system" },
	{
		text: "[SYS] Resolving package.json manifest dependencies...",
		type: "info",
	},
	{
		text: "[SYS] Detected engines: Node.js (>=22.0.0), Vite (^6.2.3)",
		type: "info",
	},
	{
		text: "[VITE] Starting asset compilation & typescript check...",
		type: "info",
	},
	{
		text: "[VITE] Rendering static single-screen HTML structure...",
		type: "info",
	},
	{
		text: '[VITE] Bundling tailwindcss @import "tailwindcss" elements...',
		type: "info",
	},
	{
		text: "[VITE] ✓ Production dist/ folder generated successfully [384ms]",
		type: "success",
	},
	{
		text: "[ESBUILD] Compiling full-stack backend entrypoint: server.ts",
		type: "info",
	},
	{
		text: "[ESBUILD] Bundling with flag --platform=node --format=cjs --packages=external",
		type: "info",
	},
	{
		text: "[ESBUILD] ✓ Bundled server.ts into dist/server.cjs [120ms]",
		type: "success",
	},
	{ text: "[DOCKER] Building deployment layer containers...", type: "info" },
	{
		text: "[DOCKER] Optimizing image: stripping non-production devDependencies...",
		type: "info",
	},
	{
		text: "[DOCKER] ✓ Container image compressed: 14.12 MB [220ms]",
		type: "success",
	},
	{
		text: "[CLOUD RUN] Pushing build payload to regional edge registry...",
		type: "info",
	},
	{
		text: "[CLOUD RUN] Creating deployment revision for region: asia-southeast1",
		type: "info",
	},
	{
		text: "[CLOUD RUN] Ingress configured: routing all traffic exclusively to Port 3000",
		type: "info",
	},
	{
		text: "[CLOUD RUN] Provisioning secure serverless sandbox...",
		type: "info",
	},
	{
		text: "[DNS] Mapping global routing layer target to Edge API URL...",
		type: "info",
	},
	{ text: ":: SYSTEM DEPLOYMENT COMPLETED ON EDGE NODES ::", type: "success" },
];

export default function DeployModal({ isOpen, onClose }: DeployModalProps) {
	const [status, setStatus] = useState<
		"idle" | "building" | "success" | "error"
	>("idle");
	const [logs, setLogs] = useState<DeployLog[]>([]);
	const [progress, setProgress] = useState(0);
	const terminalEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (terminalEndRef.current) {
			terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [logs]);

	if (!isOpen) return null;

	const startDeployment = () => {
		setStatus("building");
		setLogs([]);
		setProgress(0);

		let currentLogIndex = 0;

		const runStep = (): void => {
			if (currentLogIndex >= DEPLOY_LOGS.length) {
				playScoreSound();
				setStatus("success");
				return;
			}

			const nextLog = DEPLOY_LOGS.at(currentLogIndex);

			if (nextLog === undefined) {
				playScoreSound();
				setStatus("error");
				return;
			}

			setLogs((previousLogs) => [...previousLogs, nextLog]);

			setProgress(
				Math.round(((currentLogIndex + 1) / DEPLOY_LOGS.length) * 100),
			);

			currentLogIndex += 1;

			const delay = Math.random() * 250 + 150;

			window.setTimeout(runStep, delay);
		};

		window.setTimeout(runStep, 400);
	};

	const resetDeploy = () => {
		setStatus("idle");
		setLogs([]);
		setProgress(0);
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
			id="deploy-modal-container"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 15 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 15 }}
				transition={{ duration: 0.2 }}
				className="w-full max-w-3xl h-[70vh] bg-black border-2 border-white flex flex-col relative"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-surface-stroke p-5">
					<div className="flex items-center gap-3">
						<Cloud className="w-5 h-5 text-brand-pink" />
						<h2 className="text-xl font-bold font-mono tracking-tight uppercase">
							Rakta <span className="text-brand-pink">Edge Deployment</span>
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 border border-surface-stroke hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
						id="close-deploy-btn"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Dashboard Status Controls */}
				<div className="bg-surface-card p-6 border-b border-surface-stroke flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
							PIPELINE STATUS
						</span>
						<div className="flex items-center gap-2 mt-1">
							{status === "idle" && (
								<span className="font-mono text-sm text-yellow-500 font-bold uppercase flex items-center gap-1.5">
									<span className="w-2 h-2 bg-yellow-500 animate-pulse"></span>{" "}
									IDLE - READY TO LAUNCH
								</span>
							)}
							{status === "building" && (
								<span className="font-mono text-sm text-brand-pink font-bold uppercase flex items-center gap-1.5 animate-pulse">
									<span className="w-2 h-2 bg-brand-pink"></span> COMPILES IN
									PROGRESS ({progress}%)
								</span>
							)}
							{status === "success" && (
								<span className="font-mono text-sm text-brand-green font-bold uppercase flex items-center gap-1.5">
									<span className="w-2 h-2 bg-brand-green"></span> LIVE -
									PRODUCTION DEPLOYED
								</span>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						{status === "idle" && (
							<button
								onClick={startDeployment}
								className="bg-brand-pink hover:bg-white text-white hover:text-black px-6 py-2.5 font-mono text-xs font-bold uppercase transition-all duration-150 border border-transparent active:scale-95 flex items-center gap-2 cursor-pointer"
							>
								<Play className="w-4 h-4 fill-current" /> INITIATE LAUNCH
							</button>
						)}
						{status === "building" && (
							<div className="w-32 bg-zinc-900 border border-zinc-800 p-0.5">
								<div
									className="h-4 bg-brand-pink transition-all duration-150"
									style={{ width: `${progress}%` }}
								></div>
							</div>
						)}
						{status === "success" && (
							<button
								onClick={resetDeploy}
								className="border border-white hover:bg-white hover:text-black px-4 py-2.5 font-mono text-xs uppercase transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
							>
								<RotateCcw className="w-3.5 h-3.5" /> RE-BUILD PIPELINE
							</button>
						)}
					</div>
				</div>

				{/* Terminal Logger */}
				<div className="flex-1 bg-black p-5 font-mono text-xs overflow-y-auto flex flex-col gap-2 select-text selection:bg-brand-pink/30">
					{logs.map((log, index) => {
						let textColor = "text-gray-400";
						if (log.type === "system")
							textColor =
								"text-brand-pink font-bold border-b border-brand-pink/20 pb-1 mb-2";
						if (log.type === "success")
							textColor = "text-brand-green font-bold";
						if (log.type === "info") textColor = "text-gray-300";

						return (
							<div
								key={index}
								className={`leading-relaxed whitespace-pre-wrap ${textColor}`}
							>
								{log.text}
							</div>
						);
					})}

					{status === "idle" && (
						<div className="text-gray-600 italic mt-4 text-center">
							Terminal is silent. Click 'INITIATE LAUNCH' to begin
							containerization.
						</div>
					)}

					{status === "building" && (
						<div className="text-brand-pink animate-pulse mt-2 flex items-center gap-1">
							<span className="inline-block w-1.5 h-3.5 bg-brand-pink"></span>
						</div>
					)}

					{status === "success" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-6 p-4 border border-brand-green bg-emerald-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
						>
							<div>
								<span className="font-bold text-brand-green uppercase flex items-center gap-1.5 text-xs mb-1">
									<CheckCircle2 className="w-4 h-4" /> Edge Application Online
								</span>
								<p className="text-[10px] text-gray-500 leading-normal">
									Serverless environment deployed successfully with Port-3000
									mapping routing active.
								</p>
								<p className="text-xs text-white font-mono mt-2 select-all hover:underline cursor-pointer bg-black px-2 py-1 inline-block border border-zinc-800">
									https://rakta-ready.edge.local
								</p>
							</div>

							<div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500 border-l border-zinc-800 pl-4">
								<div>RESPONSE_TIME</div>
								<div className="text-brand-green font-bold text-right">
									4.5ms
								</div>
								<div>EDGE_LOCS</div>
								<div className="text-white text-right">9 NODES</div>
								<div>COMPRESS</div>
								<div className="text-white text-right">14.12MB</div>
							</div>
						</motion.div>
					)}

					<div ref={terminalEndRef} />
				</div>
			</motion.div>
		</div>
	);
}
