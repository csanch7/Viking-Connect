import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { createEmailSender } from "../services/emailService";

describe("Amazon SES email service", () => {
  it("maps an application email to an SES v2 command", async () => {
    let capturedCommand: SendEmailCommand | undefined;
    const sendEmail = createEmailSender({
      async send(command) {
        capturedCommand = command;
        return { MessageId: "ses-message-123" };
      },
    });

    const messageId = await sendEmail({
      from: "Viking Connect <hello@example.com>",
      to: "member@example.com",
      replyTo: "visitor@example.com",
      subject: "Welcome",
      html: "<p>Welcome</p>",
      text: "Welcome",
    });

    assert.deepEqual(capturedCommand?.input, {
      FromEmailAddress: "Viking Connect <hello@example.com>",
      Destination: { ToAddresses: ["member@example.com"] },
      ReplyToAddresses: ["visitor@example.com"],
      Content: {
        Simple: {
          Subject: { Data: "Welcome", Charset: "UTF-8" },
          Body: {
            Html: { Data: "<p>Welcome</p>", Charset: "UTF-8" },
            Text: { Data: "Welcome", Charset: "UTF-8" },
          },
        },
      },
    });
    assert.equal(messageId, "ses-message-123");
  });

  it("sends one message to multiple recipients", async () => {
    let capturedCommand: SendEmailCommand | undefined;
    const sendEmail = createEmailSender({
      async send(command) {
        capturedCommand = command;
        return { MessageId: "ses-message-456" };
      },
    });

    await sendEmail({
      from: "Viking Connect <hello@example.com>",
      to: ["owner@example.com", "admin@example.com"],
      subject: "New registration",
      html: "<p>New registration</p>",
      text: "New registration",
    });

    assert.deepEqual(capturedCommand?.input.Destination?.ToAddresses, [
      "owner@example.com",
      "admin@example.com",
    ]);
  });
});
