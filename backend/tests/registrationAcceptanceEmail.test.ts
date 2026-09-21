import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderRegistrationAcceptanceEmail } from "../emails/registrationAcceptanceEmail";

describe("registration acceptance email", () => {
  it("renders the approval message, next steps, and sign-in action", () => {
    const html = renderRegistrationAcceptanceEmail(
      "https://www.vikingconnect.org/login",
    );

    assert.match(html, /Your account has been approved/);
    assert.match(html, /Sign in to Viking Connect/);
    assert.match(html, /Complete your profile/);
    assert.match(html, /Explore the directory/);
    assert.match(html, /Start a conversation/);
    assert.match(html, /https:\/\/www\.vikingconnect\.org\/login/);
    assert.match(html, /available only to approved members/);
  });

  it("escapes the sign-in URL before adding it to the email", () => {
    const html = renderRegistrationAcceptanceEmail(
      'https://example.com/login?next="profile"&source=email',
    );

    assert.doesNotMatch(html, /next="profile"&source/);
    assert.match(html, /next=&quot;profile&quot;&amp;source=email/);
  });
});
