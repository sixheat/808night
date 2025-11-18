import { Resend } from "resend";

let client = null;

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY is not set. Purchase confirmation emails will be skipped."
    );
    return null;
  }

  if (!client) {
    client = new Resend(apiKey);
  }

  return client;
}
