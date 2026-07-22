import type { CmsPost } from "../models/cms-post.model";

const posts = new Map<string, CmsPost>();

export function seedCmsPosts(): void {
	if (posts.size > 0) {
		return;
	}

	const now = new Date().toISOString();
	const post: CmsPost = {
		id: "post_welcome",
		title: "Welcome to Rakta CMS",
		slug: "welcome-to-rakta-cms",
		status: "published",
		authorId: "user_demo",
		content: "This CMS resource is ready for CRUD operations.",
		createdAt: now,
		updatedAt: now,
	};

	posts.set(post.id, post);
}

export function listCmsPosts(): CmsPost[] {
	return Array.from(posts.values());
}

export function createCmsPost(input: {
	readonly title: string;
	readonly slug: string;
	readonly authorId: string;
	readonly content: string;
	readonly status?: CmsPost["status"];
}): CmsPost {
	const now = new Date().toISOString();
	const post: CmsPost = {
		id: crypto.randomUUID(),
		title: input.title,
		slug: input.slug,
		authorId: input.authorId,
		content: input.content,
		status: input.status ?? "draft",
		createdAt: now,
		updatedAt: now,
	};

	posts.set(post.id, post);
	return post;
}

export function updateCmsPost(
	postId: string,
	input: {
		readonly title?: string;
		readonly slug?: string;
		readonly content?: string;
		readonly status?: CmsPost["status"];
	},
): CmsPost | undefined {
	const post = posts.get(postId);

	if (post === undefined) {
		return undefined;
	}

	const nextPost: CmsPost = {
		...post,
		title: input.title ?? post.title,
		slug: input.slug ?? post.slug,
		content: input.content ?? post.content,
		status: input.status ?? post.status,
		updatedAt: new Date().toISOString(),
	};

	posts.set(postId, nextPost);
	return nextPost;
}

export function deleteCmsPost(postId: string): boolean {
	return posts.delete(postId);
}
