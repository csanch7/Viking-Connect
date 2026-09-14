import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface EmailClient {
  send(command: SendEmailCommand): Promise<{ MessageId?: string } | undefined>;
}

export function createEmailSender(client: EmailClient) {
  return async function sendEmail(message: EmailMessage) {
    const response = await client.send(
      new SendEmailCommand({
        FromEmailAddress: message.from,
        Destination: { ToAddresses: [message.to] },
        ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined,
        Content: {
          Simple: {
            Subject: { Data: message.subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: message.html, Charset: "UTF-8" },
              Text: { Data: message.text, Charset: "UTF-8" },
            },
          },
        },
      }),
    );

    return response?.MessageId;
  };
}

const client = new SESv2Client({ region: process.env.AWS_REGION });

export const sendEmail = createEmailSender(client);
