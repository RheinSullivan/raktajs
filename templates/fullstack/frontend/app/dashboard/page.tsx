import { apiGet } from "../../lib/http";

interface UserRow {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly role: string;
}

interface CmsPostRow {
	readonly id: string;
	readonly title: string;
	readonly status: string;
}

const DASHBOARD_CARDS = [
	["Users", "CRUD", "Owner, admin, editor, member"],
	["Auth", "JWT", "Session, single-session, OTP"],
	["CMS", "Posts", "Draft, published, archived"],
] as const;

export default function DashboardPage() {
	const [users, setUsers] = useState<UserRow[]>([]);
	const [posts, setPosts] = useState<CmsPostRow[]>([]);
	const [status, setStatus] = useState("Connect backend after login.");

	useEffect(() => {
		Promise.all([
			apiGet<{ readonly data: UserRow[] }>("/api/users"),
			apiGet<{ readonly data: CmsPostRow[] }>("/api/cms/posts"),
		])
			.then(([usersResponse, postsResponse]) => {
				setUsers(usersResponse.data);
				setPosts(postsResponse.data);
				setStatus("Backend resources loaded.");
			})
			.catch((error: unknown) => {
				setStatus(
					error instanceof Error
						? error.message
						: "Login first to load protected resources.",
				);
			});
	}, []);

	return (
		<main className="min-h-screen bg-black text-white">
			<header className="border-b border-surface-stroke">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
					<div className="flex items-center gap-3">
						<photo path="/rakta-logo.svg" alt="Rakta.js" className="h-9 w-9" />
						<span className="font-mono text-sm font-bold">Rakta Admin</span>
					</div>
					<nav className="flex gap-5 font-mono text-xs font-bold uppercase text-gray-400">
						<click to="/">Home</click>
						<click to="/auth/login">Logout</click>
					</nav>
				</div>
			</header>
			<section className="mx-auto grid max-w-7xl gap-6 px-6 py-10">
				<div>
					<p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-pink">
						Backend Console
					</p>
					<h1 className="mt-3 text-[48px] font-extrabold uppercase leading-[0.9]">
						Dashboard Template
					</h1>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					{DASHBOARD_CARDS.map(([label, value, description]) => (
						<article
							className="border border-surface-stroke bg-[#080808] p-6"
							key={label}
						>
							<p className="font-mono text-xs uppercase text-gray-500">
								{label}
							</p>
							<strong className="mt-3 block text-4xl">{value}</strong>
							<p className="mt-2 text-sm text-gray-400">{description}</p>
						</article>
					))}
				</div>
				<section className="border border-surface-stroke bg-[#080808] p-6">
					<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
						<h2 className="font-mono text-sm font-bold uppercase">
							User CRUD by Role
						</h2>
						<span className="border border-brand-green/30 bg-brand-green/5 px-3 py-1 font-mono text-xs text-brand-green">
							{status}
						</span>
					</div>
					<div className="mt-5 overflow-x-auto">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="font-mono text-xs uppercase text-gray-500">
								<tr>
									<th className="border-b border-surface-stroke py-3">Name</th>
									<th className="border-b border-surface-stroke py-3">Email</th>
									<th className="border-b border-surface-stroke py-3">Role</th>
								</tr>
							</thead>
							<tbody>
								{(users.length > 0
									? users
									: [
											{
												id: "user_demo",
												name: "Rakta Admin",
												email: "admin@rakta.local",
												role: "owner",
											},
											{
												id: "user_editor",
												name: "CMS Editor",
												email: "editor@rakta.local",
												role: "editor",
											},
										]
								).map((user) => (
									<tr key={user.id}>
										<td className="border-b border-surface-stroke py-3">
											{user.name}
										</td>
										<td className="border-b border-surface-stroke py-3">
											{user.email}
										</td>
										<td className="border-b border-surface-stroke py-3 uppercase">
											{user.role}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
				<section className="border border-surface-stroke bg-[#080808] p-6">
					<h2 className="font-mono text-sm font-bold uppercase">CMS Posts</h2>
					<div className="mt-5 grid gap-3">
						{(posts.length > 0
							? posts
							: [
									{
										id: "post_welcome",
										title: "Welcome to Rakta CMS",
										status: "published",
									},
								]
						).map((post) => (
							<article
								className="flex items-center justify-between border border-surface-stroke px-4 py-3"
								key={post.id}
							>
								<span>{post.title}</span>
								<span className="font-mono text-xs uppercase text-brand-pink">
									{post.status}
								</span>
							</article>
						))}
					</div>
				</section>
			</section>
		</main>
	);
}
