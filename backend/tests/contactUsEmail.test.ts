import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderContactUsEmail } from "../emails/contactUsEmail";

describe("contact form email", () => {
  it("renders the sender and multiline message", () => {
    const html = renderContactUsEmail({
      sender: "visitor@example.com",
      body: "First line\nSecond line",
    });

    assert.match(html, /mailto:visitor@example\.com/);
    assert.match(html, /First line<br>Second line/);
    assert.match(html, /Reply to sender/);
  });

  it("escapes submitted content before rendering it as HTML", () => {
    const html = renderContactUsEmail({
      sender: "visitor@example.com",
      body: '<script>alert("test")</script>',
    });

    assert.doesNotMatch(html, /<script>/);
    assert.match(
      html,
      /&lt;script&gt;alert\(&quot;test&quot;\)&lt;\/script&gt;/,
    );
  });
});
