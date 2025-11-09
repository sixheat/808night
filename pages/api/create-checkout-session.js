import Stripe from "stripe";
import { getSupabaseClient } from "./_supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const maxPerOrder = isEarly ? 4 : 10;
    if (qtyInt > maxPerOrder) {
      return res.status(400).json({ error: `Max ${maxPerOrder} tickets per order for this tier.` });
    }

    if (isEarly) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from("tickets").select("quantity").eq("tier", "early_bird");
        if (error) console.error("Supabase read error", error);
        const sold = (data || []).reduce((sum, r) => sum + (r.quantity || 0), 0);
        const remaining = 50 - sold;
        if (remaining <= 0) return res.status(400).json({ error: "Early Bird is sold out." });
        if (qtyInt > remaining) return res.status(400).json({ error: `Only ${remaining} Early Bird tickets remain.` });
      } else {
        console.warn("Supabase not configured; skipping global cap.");
      }
    }

    await ensurePromoBenj();

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      consent_collection: { terms_of_service: "none" },
      custom_text: { submit: { message: "No refunds. High school only. Security enforced." } },
      metadata: {
        event: "NO SLEEP NOV14",
        tier: isEarly ? "early_bird" : "general_admission",
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
