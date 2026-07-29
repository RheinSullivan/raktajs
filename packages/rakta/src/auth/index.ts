export type { MagicLinkEmail, MagicLinkPayload } from "./magicLink";
export {
	createMagicLinkEmail,
	generateMagicLinkToken,
	verifyMagicLinkToken,
} from "./magicLink";

export {
	generateBackupCodes,
	generateTotpSecret,
	generateTotpUri,
	verifyBackupCode,
	verifyTotp,
} from "./twoFactor";
