import Stripe from "stripe";
import { buffer } from "node:stream/consumers";
import { v4 as uuidv4 } from "uuid";
import CustomerTicketEmail from "../../emails/CustomerTicketEmail";
import { getResend } from "../../lib/email";

export const config = { api: { bodyParser: false } };

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "tickets@nosleep.events";
const ADMIN_EMAIL =
  process.env.RESEND_ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail =
      session.customer_details?.email || session.customer_email || null;
    const customerName =
      session.customer_details?.name || session.customer_details?.email || "Guest";
    const eventName =
      session.metadata?.eventName || session.metadata?.event || "NO SLEEP DEC6";
    const eventLocation =
      session.metadata?.eventLocation || session.metadata?.city || "Location drops day of";
    const ticketType =
      session.metadata?.ticketType || session.metadata?.tier || "General Admission";

    const ticketId = uuidv4();
    const resend = getResend();

    if (!resend) {
      console.warn("Resend client unavailable. Skipping ticket emails.");
    } else {
      if (customerEmail) {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `Your Ticket for ${eventName}!`,
            react: (
              <CustomerTicketEmail
                customerName={customerName}
                eventName={eventName}
                location={eventLocation}
                ticketId={ticketId}
              />
            ),
          });
        } catch (error) {
          console.error("Failed to send customer ticket email", error);
        }
      } else {
        console.warn(
          "No customer email present on checkout session; skipping customer notification"
        );
      }

      if (ADMIN_EMAIL) {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `New ${ticketType} ticket sold`,
            html: `
              <p>A new ticket was purchased.</p>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail || "unknown"}</p>
              <p><strong>Ticket Type:</strong> ${ticketType}</p>
              <p><strong>Ticket ID:</strong> ${ticketId}</p>
            `,
          });
        } catch (error) {
          console.error("Failed to send admin notification email", error);
        }
      }
    }
  }

  res.json({ received: true });
}
