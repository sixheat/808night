import Script from "next/script";
import { useState, useEffect } from "react";

function StatusIndicator() {
  const [status, setStatus] = useState({
    status: "checking",
    message: "Checking system status...",
    color: "#6b7280",
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setStatus({
          status: data.status || "error",
          message: data.message || "Status unknown",
          color: data.color || "#ef4444",
        });
      } catch (error) {
        setStatus({
          status: "error",
          message: "Unable to check status",
          color: "#ef4444",
        });
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 10 seconds
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    switch (status.status) {
      case "operational":
        return "All systems operational";
      case "degraded":
        return "Some issues detected";
      case "down":
        return "Service unavailable";
      case "checking":
        return "Checking status...";
      default:
        return status.message;
    }
  };

  return (
    <a href="/status" className="status-link">
      <div className="status-indicator" style={{ borderColor: status.color }}>
        <span 
          className="status-dot" 
          style={{ 
            background: status.color,
            boxShadow: `0 0 8px ${status.color}40`
          }}
        ></span>
        <span className="status-text" style={{ color: status.color }}>
          {getStatusText()}
        </span>
      </div>
    </a>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState("early"); // "early" | "ga"
  const [qty, setQty] = useState(1);

  const PRICES = { early: 29.5, ga: 49.5 };
  const total = (PRICES[tier] * qty).toFixed(2);

  async function buy() {
    setLoading(true);
    try {
      const r = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, qty }),
      });
      const data = await r.json();
      if (data?.id) {
        const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert(data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
      <main className="wrap">
        <div className="card">
          <div className="logo">NO SLEEP</div>
          <h1>NO SLEEP NOV21</h1>
          <h2>New York · Location drops day of</h2>
          <div className="row" style={{marginTop: 6}}>
            <span className="badge">Friday, Nov 21</span>
            <span className="badge">9:00 PM — LATE</span>
            <span className="badge">STRICT SECURITY</span>
            <span className="badge">NO REFUNDS</span>
            <span className="badge">HIGH SCHOOL ONLY</span>
          </div>

          <div style={{marginTop: 18}}>
            <img src="/cover.png" alt="NO SLEEP NOV21 cover" style={{width:"100%", maxWidth: "720px", borderRadius: "16px", display:"block", margin:"0 auto", boxShadow:"0 10px 40px rgba(255,0,0,.25)"}}/>
          </div>

          <hr className="hr" />

          <section style={{textAlign:"left"}}>
            <p><strong>Friday night is calling, and it’s not asking nicely.</strong> NO SLEEP NOV21 is the party everyone is gonna be talking about. If you want a night that actually goes crazy, this is where you need to be.</p>
            <p><strong>NYC</strong> — Location drops day of<br/>
            <strong>Friday, November 21</strong> — 9:00 PM until late<br/>
            <strong>HIGH SCHOOL ONLY</strong></p>
            <p><strong>Security on-site</strong><br/>
            <strong>Bag checks at entry</strong></p>
            <p><strong>NO DRINKING. NO DRUGS. NO VAPES.</strong><br/>
            <strong>NO REFUNDS UNDER ANY CIRCUMSTANCES</strong></p>
            <h3 style={{marginTop:18}}>DISCLAIMER</h3>
            <p className="small">
              The event staff is not responsible for any injuries, lost items, or bad decisions.
              By entering, you agree to follow all rules from security and staff. If you break the rules,
              you’re out. No warnings. No refunds.
            </p>
            <p style={{marginTop:18}}><strong>SPECIAL GUEST… CH**KY* (1M+ FOLLOWERS)</strong><br/>
            <em>WHO COULD IT BE?!</em></p>
          </section>

          <hr className="hr" />

          <h2 style={{textAlign:"center"}}>Choose Your Ticket</h2>
          <div className="row" style={{marginTop:12}}>
            <label className="card" style={{cursor:"pointer", textAlign:"left", maxWidth:340}}>
              <input type="radio" name="tier" value="early" checked={tier === "early"} onChange={() => setTier("early")} />{" "}
              <strong>Early Bird — $29.50</strong>
              <div className="small">50 available total · limit 4 per order</div>
            </label>
            <label className="card" style={{cursor:"pointer", textAlign:"left", maxWidth:340}}>
              <input type="radio" name="tier" value="ga" checked={tier === "ga"} onChange={() => setTier("ga")} />{" "}
              <strong>General Admission — $49.50</strong>
              <div className="small">Standard entry</div>
            </label>
          </div>

          <div className="row" style={{marginTop:12}}>
            <label>
              <div className="small">Quantity</div>
              <input
                className="input"
                type="number"
                min="1"
                max={tier === "early" ? 4 : 10}
                step="1"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value || 1,10);
                  const max = tier === "early" ? 4 : 10;
                  if (v > max) return setQty(max);
                  if (v < 1) return setQty(1);
                  setQty(v);
                }}
              />
            </label>
          </div>

          <button className="btn" onClick={buy} disabled={loading}>
            {loading ? "Loading…" : `Checkout • $${(PRICES[tier] * qty).toFixed(2)}`}
          </button>

          <div className="links">
            <a href="/terms">Terms</a> · <a href="/refunds">Refunds</a>
          </div>

          <p className="help">By purchasing, you agree to our Terms. High school only. No alcohol/drugs. Violations = removal without refund.</p>
        </div>

        <div className="footer">
          &copy; {new Date().getFullYear()} NO SLEEP NOV21
        </div>
      </main>
      
      <StatusIndicator />
    </>
  );
}
