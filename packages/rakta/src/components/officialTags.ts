export const RAKTA_OFFICIAL_CUSTOM_TAGS = [
	"click",
	"picture",
	"lazy",
	"guard",
	"seal",
	"shelf",
	"island",
	"prefetch",
	"route",
	"resource",
] as const;

export const RAKTA_EXCLUDED_COMPAT_TAGS = [
	"pantura",
	"reborns",
	"form",
	"title",
] as const;

export type RaktaOfficialCustomTag =
	(typeof RAKTA_OFFICIAL_CUSTOM_TAGS)[number];
export type RaktaExcludedCompatTag = (typeof RAKTA_EXCLUDED_COMPAT_TAGS)[number];
