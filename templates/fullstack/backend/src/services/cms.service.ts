import { database } from "../database/client";
import type { CmsPost } from "../models/cms-post.model";
import { type StoredFile, storageProvider } from "../storage/provider";

export function seedCmsPosts(): void {
	if (database.cmsPosts.all().length > 0) {
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

	database.cmsPosts.create(post);
}

export function listCmsPosts(): CmsPost[] {
	return [...database.cmsPosts.all()];
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

	database.cmsPosts.create(post);
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
	const post = database.cmsPosts.find(postId);

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

	database.cmsPosts.update(postId, nextPost);
	return nextPost;
}

export function deleteCmsPost(postId: string): boolean {
	return database.cmsPosts.delete(postId);
}

export async function uploadCmsMedia(input: {
	readonly fileName: string;
	readonly body: Uint8Array;
	readonly contentType: string;
}): Promise<StoredFile> {
	return storageProvider.put({
		key: `cms/${crypto.randomUUID()}-${input.fileName}`,
		body: input.body,
		contentType: input.contentType,
	});
}
