import type { CmsPost } from "../models/cms-post.model";
import type { User } from "../models/user.model";
import { MemoryRepository } from "./repository";

export const database = {
	users: new MemoryRepository<User>(),
	cmsPosts: new MemoryRepository<CmsPost>(),
};

export type DatabaseClient = typeof database;
