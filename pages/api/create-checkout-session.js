import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const EARLY_BIRD_DEFAULT_CAP = 50;

function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || '';
  // Ensure HTTPS in production (not localhost)
  if (url && !url.includes('localhost') && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

function getEarlyBirdCap() {
  const parsed = parseInt(process.env.EARLY_BIRD_CAP || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : EARLY_BIRD_DEFAULT_CAP;
}

async function getTicketsSoldForTier(tierKey) {
  let total = 0;
  const sessions = stripe.checkout.sessions.list({ limit: 100 });

  for await (const session of sessions) {
    const metadataTier = session.metadata?.tier;
    if (metadataTier !== tierKey) continue;

    const isPaid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required" ||
      session.status === "complete";
    if (!isPaid) continue;

    const qty = parseInt(session.metadata?.qty || "0", 10);
    if (Number.isFinite(qty) && qty > 0) {
      total += qty;
    }
  }

  return total;
}

async function ensurePromoBenj() {
  try {
    const existing = await stripe.promotionCodes.list({ code: "benj", limit: 1 });
    if (existing.data && existing.data.length > 0) return existing.data[0];
    const coupon = await stripe.coupons.create({ percent_off: 10, duration: "forever" });
    const promo = await stripe.promotionCodes.create({ coupon: coupon.id, code: "benj", active: true });
    return promo;
  } catch (e) {
    console.warn("Promo ensure failed:", e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { tier, qty } = req.body || {};
    const qtyInt = Math.max(1, Math.min(parseInt(qty || 1, 10), 10));
    const isEarly = tier === "early";
    const unitAmount = isEarly ? 2950 : 4950; // cents
    const metadataTier = isEarly ? "early_bird" : "general_admission";
    const earlyBirdCap = getEarlyBirdCap();

    const maxPerOrder = isEarly ? 4 : 10;
    if (qtyInt > maxPerOrder) {
      return res.status(400).json({ error: `Max ${maxPerOrder} tickets per order for this tier.` });
    }

    if (isEarly) {
      const sold = await getTicketsSoldForTier("early_bird");
      if (sold >= earlyBirdCap) {
        return res.status(400).json({ error: "Early Bird tickets are sold out." });
      }
      if (sold + qtyInt > earlyBirdCap) {
        const remaining = Math.max(earlyBirdCap - sold, 0);
        return res
          .status(400)
          .json({ error: `Only ${remaining} Early Bird ticket${remaining === 1 ? "" : "s"} left.` });
      }
    }

    await ensurePromoBenj();

    const baseUrl = getBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: isEarly ? "NO SLEEP NOV14 — Early Bird" : "NO SLEEP NOV14 — General Admission" },
            unit_amount: unitAmount
          },
          quantity: qtyInt
        }
      ],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      consent_collection: { terms_of_service: "none" },
      custom_text: { submit: { message: "No refunds. High school only. Security enforced." } },
      metadata: {
        event: "NO SLEGHT NOV14",
        tier: metadataTier,
        qty: String(qtyInt),
        city: "New York",
        start: "2025-11-14T21:00:00-05:00"
      }
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
