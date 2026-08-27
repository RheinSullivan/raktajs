export interface CmsPost {
	readonly id: string;
	readonly title: string;
	readonly slug: string;
	readonly status: "draft" | "published" | "archived";
	readonly authorId: string;
	readonly content: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}
