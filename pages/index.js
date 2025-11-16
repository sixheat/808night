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
  const [tier, setTier] = useState("ga"); // "ga" | "vip"
  const [qty, setQty] = useState(1);

  const PRICES = { ga: 41.41, vip: 67.67 };
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
          
          {/* Special Guest Announcement - Top Priority */}
          <div style={{
            marginTop: "20px",
            marginBottom: "20px",
            padding: "20px",
            background: "linear-gradient(135deg, rgba(255,0,0,0.15) 0%, rgba(200,0,0,0.25) 100%)",
            border: "2px solid #ff4d4d",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(255,0,0,0.3)"
          }}>
            <div style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#ff9d9d",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              SPECIAL GUEST… CH**KY* (1M+ FOLLOWERS)
            </div>
            <div style={{
              fontSize: "20px",
              fontStyle: "italic",
              color: "#ffbdbd",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              WHO COULD IT BE?!
            </div>
          </div>

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
            <p><strong>FRIDAY NIGHT IS CALLING, AND IT'S NOT ASKING NICELY.</strong> NO SLEEP NOV21 IS THE PARTY EVERYONE IS GONNA BE TALKING ABOUT. IF YOU WANT A NIGHT THAT ACTUALLY GOES CRAZY, THIS IS WHERE YOU NEED TO BE.</p>
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
              you're out. No warnings. No refunds.
            </p>
          </section>

          <hr className="hr" />

          <h2 style={{textAlign:"center"}}>Choose Your Ticket</h2>
          <div className="row" style={{marginTop:12, gap: "16px", flexWrap: "wrap", justifyContent: "center"}}>
            <label className="card" style={{cursor:"pointer", textAlign:"left", maxWidth:340, position: "relative"}}>
              <input type="radio" name="tier" value="ga" checked={tier === "ga"} onChange={() => setTier("ga")} />{" "}
              <strong>General Admission — $41.41</strong>
              <div className="small">Standard entry</div>
            </label>
            <label 
              className="card" 
              style={{
                cursor:"pointer", 
                textAlign:"left", 
                maxWidth:340, 
                position: "relative",
                background: tier === "vip" 
                  ? "linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,165,0,0.3) 50%, rgba(255,215,0,0.25) 100%)"
                  : "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,165,0,0.12) 50%, rgba(255,215,0,0.08) 100%)",
                border: tier === "vip" ? "2px solid #ffd700" : "2px solid rgba(255,215,0,0.4)",
                boxShadow: tier === "vip" 
                  ? "0 0 40px rgba(255,215,0,0.6), 0 8px 32px rgba(255,215,0,0.4), inset 0 0 30px rgba(255,215,0,0.15), 0 0 60px rgba(255,215,0,0.3)"
                  : "0 0 20px rgba(255,215,0,0.3), 0 4px 16px rgba(255,215,0,0.2), inset 0 0 15px rgba(255,215,0,0.08)",
                transform: tier === "vip" ? "scale(1.03)" : "scale(1)",
                transition: "all 0.3s ease",
                overflow: "visible"
              }}
            >
              {/* Spotlight effect overlay */}
              <div style={{
                position: "absolute",
                top: "-50%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
                opacity: tier === "vip" ? 1 : 0.6,
                transition: "opacity 0.3s ease"
              }} />
              <div style={{
                position: "absolute",
                top: "-8px",
                right: "12px",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 12px rgba(255,107,107,0.4)",
                zIndex: 1
              }}>
                LIMITED
              </div>
              <input 
                type="radio" 
                name="tier" 
                value="vip" 
                checked={tier === "vip"} 
                onChange={() => setTier("vip")} 
                style={{position: "relative", zIndex: 1}}
              />{" "}
              <strong style={{
                color: tier === "vip" ? "#ffd700" : "#ffed4e",
                textShadow: tier === "vip" ? "0 0 10px rgba(255,215,0,0.5)" : "0 0 5px rgba(255,215,0,0.3)",
                position: "relative",
                zIndex: 1
              }}>
                VIP - Skip The Line — $67.67
              </strong>
              <div className="small" style={{
                color: tier === "vip" ? "#ffed4e" : "rgba(255,237,78,0.8)",
                position: "relative",
                zIndex: 1
              }}>
                Fast-track entry · Priority access
              </div>
            </label>
          </div>

          <div className="row" style={{marginTop:12}}>
            <label>
              <div className="small">Quantity</div>
              <input
                className="input"
                type="number"
                min="1"
                max={10}
                step="1"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value || 1,10);
                  const max = 10;
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
