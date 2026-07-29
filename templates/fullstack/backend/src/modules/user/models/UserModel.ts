// Re-export from canonical model to avoid type duplication
export type {
	Gender,
	PublicUser,
	User,
	UserRole,
} from "../../../models/user.model";
export { toPublicUser } from "../../../models/user.model";
