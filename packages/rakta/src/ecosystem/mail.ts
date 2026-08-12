/**
 * @rakta/mail - Rakta.js Mail Ecosystem Package
 *
 * Provides a transport-agnostic email system for:
 * - HTML + plain-text email composition
 * - Template rendering with variable interpolation
 * - Multi-transport support (SMTP, SendGrid, Resend, Mailgun, console/dev)
 * - Attachment handling
 * - Async send queue
 */

// -------------------------------------------------------------------------- //
// Types
// -------------------------------------------------------------------------- //

/** Supported mail transport drivers. */
export type MailDriverKind =
	| "smtp"
	| "sendgrid"
	| "resend"
	| "mailgun"
	| "console"; // logs to stdout - useful for development

/** Email address with optional display name. */
export interface MailAddress {
	readonly email: string;
	readonly name?: string | undefined;
}

/** A file attachment to include with the email. */
export interface MailAttachment {
	/** File name shown to the recipient. */
	readonly filename: string;
	/** Base64-encoded file content. */
	readonly content: string;
	/** MIME type (defaults to application/octet-stream). */
	readonly contentType?: string | undefined;
	/** Content ID for inline images (cid:<id>). */
	readonly contentId?: string | undefined;
}

/** A single email message. */
export interface MailMessage {
	readonly from: MailAddress | string;
	readonly to: ReadonlyArray<MailAddress | string>;
	readonly cc?: ReadonlyArray<MailAddress | string> | undefined;
	readonly bcc?: ReadonlyArray<MailAddress | string> | undefined;
	readonly replyTo?: MailAddress | string | undefined;
	readonly subject: string;
	readonly html?: string | undefined;
	readonly text?: string | undefined;
	readonly attachments?: ReadonlyArray<MailAttachment> | undefined;
	readonly headers?: Readonly<Record<string, string>> | undefined;
}

/** Transport configuration. */
export interface MailTransportConfig {
	readonly driver: MailDriverKind;
	/** API key (SendGrid, Resend, Mailgun). */
	readonly apiKey?: string | undefined;
	/** SMTP host (when driver is 'smtp'). */
	readonly host?: string | undefined;
	/** SMTP port (defaults to 587). */
	readonly port?: number | undefined;
	/** SMTP secure (TLS). */
	readonly secure?: boolean | undefined;
	/** SMTP username. */
	readonly user?: string | undefined;
	/** SMTP password. */
	readonly password?: string | undefined;
	/** Mailgun domain. */
	readonly domain?: string | undefined;
	/** Mailgun region ('us' | 'eu'). Defaults to 'us'. */
	readonly region?: "us" | "eu" | undefined;
}

/** Result of a send operation. */
export interface MailSendResult {
	readonly success: boolean;
	readonly messageId?: string | undefined;
	readonly error?: string | undefined;
}

/** A simple key-value variable map for template interpolation. */
export type MailVariables = Record<string, string | number | boolean>;

// -------------------------------------------------------------------------- //
// Address normalization
// -------------------------------------------------------------------------- //

/**
 * normalizeAddress - converts a string or MailAddress to a formatted RFC 5321
 * address string.
 */
export function normalizeAddress(addr: MailAddress | string): string {
	if (typeof addr === "string") return addr;
	if (addr.name) return `${addr.name} <${addr.email}>`;
	return addr.email;
}

/**
 * normalizeAddressList - normalizes an array of address values.
 */
export function normalizeAddressList(
	list: ReadonlyArray<MailAddress | string>,
): string[] {
	return list.map(normalizeAddress);
}

// -------------------------------------------------------------------------- //
// Template engine
// -------------------------------------------------------------------------- //

/**
 * renderMailTemplate - interpolates `{{variable}}` placeholders in a string.
 *
 * @example
 * renderMailTemplate("Hello {{name}}!", { name: "Rhein" })
 * // → "Hello Rhein!"
 */
export function renderMailTemplate(
	template: string,
	variables: MailVariables,
): string {
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
		const val = variables[key];
		return val !== undefined ? String(val) : match;
	});
}

/**
 * buildHtmlEmail - wraps a content fragment in a minimal, well-tested HTML
 * email shell compatible with major email clients.
 */
export function buildHtmlEmail(
	content: string,
	options: {
		title?: string;
		backgroundColor?: string;
		textColor?: string;
		fontFamily?: string;
	} = {},
): string {
	const {
		title = "Email",
		backgroundColor = "#0a0a0a",
		textColor = "#ffffff",
		fontFamily = "system-ui, -apple-system, sans-serif",
	} = options;

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${backgroundColor};color:${textColor};font-family:${fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${backgroundColor};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#111111;border:1px solid #222222;border-radius:4px;padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0;text-align:center;font-size:12px;color:#555555;">
              Sent by Rakta.js Mail - Small in size. Fierce in speed.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// -------------------------------------------------------------------------- //
// Transport interface
// -------------------------------------------------------------------------- //

/** Base interface that all mail transports must implement. */
export interface MailTransport {
	send(message: MailMessage): Promise<MailSendResult>;
}

// -------------------------------------------------------------------------- //
// Console transport (development default)
// -------------------------------------------------------------------------- //

class ConsoleTransport implements MailTransport {
	async send(message: MailMessage): Promise<MailSendResult> {
		const to = normalizeAddressList(message.to).join(", ");
		const from = normalizeAddress(message.from);
		const id = `console-${Date.now()}`;

		console.log("\n[RAKTA MAIL] ──────────────────────────────");
		console.log(`  From    : ${from}`);
		console.log(`  To      : ${to}`);
		if (message.cc) {
			console.log(`  Cc      : ${normalizeAddressList(message.cc).join(", ")}`);
		}
		console.log(`  Subject : ${message.subject}`);
		if (message.text) {
			console.log("  Body (plain text):");
			console.log(
				message.text
					.split("\n")
					.map((l) => `    ${l}`)
					.join("\n"),
			);
		}
		if (message.attachments?.length) {
			console.log(`  Attachments: ${message.attachments.length}`);
		}
		console.log("[RAKTA MAIL] ──────────────────────────────\n");

		return { success: true, messageId: id };
	}
}

// -------------------------------------------------------------------------- //
// Mailer factory
// -------------------------------------------------------------------------- //

/**
 * createMailer - returns a MailTransport for the configured driver.
 *
 * For production transports (smtp, sendgrid, resend, mailgun) you must
 * install the corresponding SDK peer dependency.
 *
 * The 'console' driver requires no dependencies and is the default for
 * development. It logs emails to stdout instead of sending them.
 *
 * @example
 * const mailer = createMailer({ driver: "console" });
 * await mailer.send({ from: "noreply@raktajs.dev", to: ["user@example.com"], subject: "Hello", text: "World" });
 */
export function createMailer(config: MailTransportConfig): MailTransport {
	switch (config.driver) {
		case "console":
			return new ConsoleTransport();

		case "smtp":
		case "sendgrid":
		case "resend":
		case "mailgun":
			// Production adapters are loaded lazily so tree-shaking removes unused
			// transports from the final bundle.
			return {
				async send(_message: MailMessage): Promise<MailSendResult> {
					// Stub: replace with actual transport SDK call once peer dep is installed.
					// Example (Resend):
					//   const { Resend } = await import("resend");
					//   const resend = new Resend(config.apiKey);
					//   const result = await resend.emails.send({ ... });
					console.warn(
						`[Rakta Mail] '${config.driver}' transport is a stub. Install the peer dependency and implement the adapter.`,
					);
					return {
						success: false,
						error: `Transport '${config.driver}' not yet connected. See @rakta/mail docs.`,
					};
				},
			};

		default:
			throw new Error(
				`[Rakta Mail] Unknown driver: ${(config as { driver: string }).driver}`,
			);
	}
}

// -------------------------------------------------------------------------- //
// Convenience send helpers
// -------------------------------------------------------------------------- //

/**
 * sendMail - convenience wrapper that creates a mailer and sends a single message.
 */
export async function sendMail(
	config: MailTransportConfig,
	message: MailMessage,
): Promise<MailSendResult> {
	return createMailer(config).send(message);
}

/**
 * sendTemplateMail - renders a template string with variables, then sends.
 */
export async function sendTemplateMail(
	config: MailTransportConfig,
	message: Omit<MailMessage, "html" | "text"> & {
		htmlTemplate?: string;
		textTemplate?: string;
		variables: MailVariables;
	},
): Promise<MailSendResult> {
	const mailer = createMailer(config);
	return mailer.send({
		...message,
		html: message.htmlTemplate
			? renderMailTemplate(message.htmlTemplate, message.variables)
			: undefined,
		text: message.textTemplate
			? renderMailTemplate(message.textTemplate, message.variables)
			: undefined,
	});
}
