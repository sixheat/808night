import Stripe from "stripe";
import { buffer } from "node:stream/consumers";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
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
    const tier = session.metadata?.tier || "unknown";
    const qty = parseInt(session.metadata?.qty || "1", 10);
  }

  res.json({ received: true });
}
