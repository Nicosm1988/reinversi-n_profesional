import { describe, expect, it } from "vitest";
import {
  checkContactRequest,
  CONTACT_REQUEST_HEADER,
  CONTACT_REQUEST_HEADER_VALUE,
} from "@/lib/contact/request-security";

function request(headers: Record<string, string>) {
  return new Request("https://senda.example/api/contact", { method: "POST", headers });
}

describe("checkContactRequest", () => {
  it("accepts same-origin requests with the contact form header", () => {
    expect(
      checkContactRequest(
        request({
          origin: "https://senda.example",
          "sec-fetch-site": "same-origin",
          [CONTACT_REQUEST_HEADER]: CONTACT_REQUEST_HEADER_VALUE,
        }),
      ),
    ).toEqual({ ok: true, origin: "https://senda.example" });
  });

  it("rejects missing custom headers", () => {
    expect(checkContactRequest(request({ origin: "https://senda.example" }))).toEqual({
      ok: false,
      reason: "custom-header",
    });
  });

  it("rejects missing or cross-site origins", () => {
    expect(
      checkContactRequest(request({ [CONTACT_REQUEST_HEADER]: CONTACT_REQUEST_HEADER_VALUE })),
    ).toEqual({ ok: false, reason: "missing-origin" });

    expect(
      checkContactRequest(
        request({
          origin: "https://attacker.example",
          "sec-fetch-site": "cross-site",
          [CONTACT_REQUEST_HEADER]: CONTACT_REQUEST_HEADER_VALUE,
        }),
      ),
    ).toEqual({ ok: false, reason: "cross-origin" });
  });
});
