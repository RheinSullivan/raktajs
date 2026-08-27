export interface MailMessage {
	readonly to: string;
	readonly subject: string;
	readonly text: string;
}

export interface MailProvider {
	send(message: MailMessage): Promise<void>;
}

class ConsoleMailProvider implements MailProvider {
	async send(message: MailMessage): Promise<void> {
		console.log(
			`[mail] to=${message.to} subject=${message.subject} body=${message.text}`,
		);
	}
}

export const mailProvider: MailProvider = new ConsoleMailProvider();
