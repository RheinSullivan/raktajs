import { readJson } from "../http/request";
import { created, fail, ok } from "../http/response";
import {
	createCmsPost,
	deleteCmsPost,
	listCmsPosts,
	updateCmsPost,
} from "../services/cms.service";

export function indexCmsPostsController(): Response {
	return ok(listCmsPosts());
}

export async function storeCmsPostController(
	request: Request,
): Promise<Response> {
	const body = await readJson(request);

	return created(
		createCmsPost({
			title: String(body.title ?? ""),
			slug: String(body.slug ?? ""),
			authorId: String(body.authorId ?? "user_demo"),
			content: String(body.content ?? ""),
			status: body.status === "published" ? "published" : "draft",
		}),
	);
}

export async function updateCmsPostController(
	postId: string,
	request: Request,
): Promise<Response> {
	const body = await readJson(request);
	const input: {
		title?: string;
		slug?: string;
		content?: string;
		status?: "draft" | "published" | "archived";
	} = {};

	if (typeof body.title === "string") input.title = body.title;
	if (typeof body.slug === "string") input.slug = body.slug;
	if (typeof body.content === "string") input.content = body.content;
	if (
		body.status === "draft" ||
		body.status === "published" ||
		body.status === "archived"
	) {
		input.status = body.status;
	}

	const post = updateCmsPost(postId, input);
	return post === undefined ? fail("CMS post not found.", 404) : ok(post);
}

export function destroyCmsPostController(postId: string): Response {
	return deleteCmsPost(postId)
		? ok({ deleted: true })
		: fail("CMS post not found.", 404);
}
