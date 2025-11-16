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

    checkStatus();
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

// Audio Visualizer Component
function AudioVisualizer() {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const barCount = 20;
    const newBars = Array.from({ length: barCount }, () => ({
      height: Math.random() * 60 + 20,
      delay: Math.random() * 0.5,
    }));
    setBars(newBars);
  }, []);

  return (
    <div className="audio-visualizer">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="visualizer-bar"
          style={{
            height: `${bar.height}%`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState("ga");
  const [qty, setQty] = useState(1);
  const [showTicketSection, setShowTicketSection] = useState(false);
  const [activeCarousel, setActiveCarousel] = useState(0);

  const PRICES = { ga: 41.41, vip: 67.67 };

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

  const scrollToTickets = () => {
    setShowTicketSection(true);
    setTimeout(() => {
      const ticketSection = document.getElementById("ticket-section");
      if (ticketSection) {
        ticketSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <>
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
      
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-l">L</span>
            <span className="logo-v">V</span>
            <span className="logo-text">NO SLEEP</span>
          </div>
          <nav className="main-nav">
            <a href="#events">All Events</a>
            <a href="#festivals">Festivals</a>
            <a href="#comedy">Comedy</a>
            <a href="#week">Event Week</a>
          </nav>
          <div className="header-actions">
            <button className="icon-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zm0-2a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="currentColor"/>
                <path d="M13.5 13.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icon-btn" aria-label="Language">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 2a12.5 12.5 0 0 1 0 16M10 2a12.5 12.5 0 0 0 0 16M2 10h16" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button className="login-btn">Log In</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <AudioVisualizer />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">NO SLEEP NOV21</h1>
          <p className="hero-description">
            Don't miss the party everyone's talking about! Secure your tickets today for an unforgettable night of music, energy, and non-stop fun!
          </p>
          <button className="hero-cta" onClick={scrollToTickets}>
            Tickets On Sale Now
          </button>
          <div className="carousel-indicators">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                className={`carousel-dot ${activeCarousel === index ? "active" : ""}`}
                onClick={() => setActiveCarousel(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shows Section */}
      <section className="shows-section">
        <h2 className="shows-title">Shows In New York</h2>
        <div className="filter-container">
          <button className="filter-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "8px" }}>
              <path d="M8 0L10.5 5.5L16 8L10.5 10.5L8 16L5.5 10.5L0 8L5.5 5.5L8 0Z" fill="currentColor"/>
            </svg>
            All Genres
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "8px" }}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="filter-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "8px" }}>
              <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="currentColor"/>
              <path d="M8 8V12M3 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            All Location
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "8px" }}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="filter-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "8px" }}>
              <rect x="3" y="4" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 6H13M6 4V2M10 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            All Dates
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "8px" }}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="find-events-btn" onClick={scrollToTickets}>
            Find Events
          </button>
        </div>
      </section>

      {/* Ticket Section */}
      <section id="ticket-section" className="ticket-section">
        <div className="ticket-container">
          <div className="event-details-card">
            <div className="event-badges">
              <span className="event-badge">Friday, Nov 21</span>
              <span className="event-badge">9:00 PM — LATE</span>
              <span className="event-badge">STRICT SECURITY</span>
              <span className="event-badge">NO REFUNDS</span>
              <span className="event-badge">HIGH SCHOOL ONLY</span>
            </div>

            <div className="event-image-container">
              <img src="/cover.png" alt="NO SLEEP NOV21 cover" className="event-image"/>
            </div>

            <div className="special-guest-announcement">
              <div className="special-guest-title">
                SPECIAL GUEST… CH**KY* (1M+ FOLLOWERS)
              </div>
              <div className="special-guest-subtitle">
                WHO COULD IT BE?!
              </div>
            </div>

            <div className="event-info">
              <p><strong>FRIDAY NIGHT IS CALLING, AND IT'S NOT ASKING NICELY.</strong> NO SLEEP NOV21 IS THE PARTY EVERYONE IS GONNA BE TALKING ABOUT. IF YOU WANT A NIGHT THAT ACTUALLY GOES CRAZY, THIS IS WHERE YOU NEED TO BE.</p>
              <p><strong>NYC</strong> — Location drops day of<br/>
              <strong>Friday, November 21</strong> — 9:00 PM until late<br/>
              <strong>HIGH SCHOOL ONLY</strong></p>
              <p><strong>Security on-site</strong><br/>
              <strong>Bag checks at entry</strong></p>
              <p><strong>NO DRINKING. NO DRUGS. NO VAPES.</strong><br/>
              <strong>NO REFUNDS UNDER ANY CIRCUMSTANCES</strong></p>
              <h3>DISCLAIMER</h3>
              <p className="small">
                The event staff is not responsible for any injuries, lost items, or bad decisions.
                By entering, you agree to follow all rules from security and staff. If you break the rules,
                you're out. No warnings. No refunds.
              </p>
            </div>

            <div className="ticket-selection">
              <h2>Choose Your Ticket</h2>
              <div className="ticket-options">
                <label className={`ticket-option ${tier === "ga" ? "selected" : ""}`}>
                  <input 
                    type="radio" 
                    name="tier" 
                    value="ga" 
                    checked={tier === "ga"} 
                    onChange={() => setTier("ga")} 
                  />
                  <div className="ticket-option-content">
                    <strong>General Admission — $41.41</strong>
                    <div className="small">Standard entry</div>
                  </div>
                </label>
                <label className={`ticket-option vip-option ${tier === "vip" ? "selected" : ""}`}>
                  <input 
                    type="radio" 
                    name="tier" 
                    value="vip" 
                    checked={tier === "vip"} 
                    onChange={() => setTier("vip")} 
                  />
                  <div className="ticket-option-content">
                    <div className="limited-badge">LIMITED</div>
                    <strong>VIP - Skip The Line — $67.67</strong>
                    <div className="small">Fast-track entry · Priority access</div>
                  </div>
                </label>
              </div>

              <div className="quantity-selector">
                <label>
                  <div className="small">Quantity</div>
                  <input
                    className="quantity-input"
                    type="number"
                    min="1"
                    max={10}
                    step="1"
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || 1, 10);
                      const max = 10;
                      if (v > max) return setQty(max);
                      if (v < 1) return setQty(1);
                      setQty(v);
                    }}
                  />
                </label>
              </div>

              <button className="checkout-btn" onClick={buy} disabled={loading}>
                {loading ? "Loading…" : `Checkout • $${(PRICES[tier] * qty).toFixed(2)}`}
              </button>

              <div className="ticket-links">
                <a href="/terms">Terms</a> · <a href="/refunds">Refunds</a>
              </div>

              <p className="ticket-help">
                By purchasing, you agree to our Terms. High school only. No alcohol/drugs. Violations = removal without refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        &copy; {new Date().getFullYear()} NO SLEEP NOV21
      </footer>
      
      <StatusIndicator />
    </>
  );
}
