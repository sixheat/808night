import Script from "next/script";
import Head from "next/head";
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

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date('2024-11-21T21:00:00-05:00');
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-timer">
      <div className="countdown-item">
        <span className="countdown-value">{timeLeft.days}</span>
        <span className="countdown-label">Days</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">Hours</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">Minutes</span>
      </div>
      <span className="countdown-separator">:</span>
      <div className="countdown-item">
        <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">Seconds</span>
      </div>
    </div>
  );
}

// Enhanced Audio Visualizer Component
function AudioVisualizer() {
  const [bars, setBars] = useState([]);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const barCount = 30;
    const newBars = Array.from({ length: barCount }, () => ({
      height: Math.random() * 70 + 30,
      delay: Math.random() * 0.8,
      speed: Math.random() * 0.5 + 0.5,
    }));
    setBars(newBars);

    // Update bars periodically for dynamic effect
    const interval = setInterval(() => {
      setBars(prevBars => prevBars.map(bar => ({
        ...bar,
        height: Math.random() * 70 + 30,
      })));
    }, 200);

    // Pulse effect
    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <>
      <div className="audio-visualizer">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="visualizer-bar"
            style={{
              height: `${bar.height}%`,
              animationDelay: `${bar.delay}s`,
              animationDuration: `${bar.speed}s`,
            }}
          />
        ))}
      </div>
      <div className="music-pulse" style={{ animationDelay: `${pulse * 0.2}s` }}></div>
      <div className="music-waves">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="wave-circle" style={{ animationDelay: `${i * 0.3}s` }}></div>
        ))}
      </div>
    </>
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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-image-bg"></div>
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

      {/* Upcoming Events Section */}
      <section className="upcoming-events-section">
        <div className="upcoming-events-container">
          <h2 className="upcoming-events-title">OUR UPCOMING EVENTS</h2>
          
          <div className="event-card">
            <div className="event-card-details">
              <div className="event-date">21 November, Friday</div>
              <h3 className="event-name">NO SLEEP NOV21</h3>
              <div className="event-performers">Special Guest: CH**KY* (1M+ FOLLOWERS)</div>
              <div className="event-location">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "6px" }}>
                  <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="currentColor"/>
                  <path d="M8 8V12M3 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                NYC — Location drops day of
              </div>
            </div>
            <button className="get-ticket-btn" onClick={scrollToTickets}>
              Get Your Ticket
            </button>
          </div>
        </div>
      </section>

      {/* Ticket Section - Modern Full-Screen Design */}
      <section id="ticket-section" className="ticket-section-modern">
        <div className="ticket-bg-animation"></div>
        <div className="countdown-container-fixed">
          <div className="countdown-label-fixed">Event Starts In</div>
          <CountdownTimer />
        </div>
        <div className="ticket-grid-container">
          {/* Left Side - Event Details */}
          <div className="ticket-left-panel">
            <div className="event-header-modern">
              <h1 className="event-title-modern">NO SLEEP NOV 21</h1>
              <p className="event-host-modern">HOSTED BY @babyboybenj</p>
            </div>
            
            <div className="event-badges-modern">
              <span className="event-badge-modern">Friday, Nov 21</span>
              <span className="event-badge-modern">9:00 PM — LATE</span>
              <span className="event-badge-modern">STRICT SECURITY</span>
              <span className="event-badge-modern">NO REFUNDS</span>
              <span className="event-badge-modern">HIGH SCHOOL ONLY</span>
          </div>

            <div className="special-guest-modern">
              <div className="special-guest-title-modern">
                SPECIAL GUEST… CH**KY* (1M+ FOLLOWERS)
              </div>
              <div className="special-guest-subtitle-modern">
                WHO COULD IT BE?!
              </div>
          </div>

            <div className="event-details-modern">
              <p><strong>FRIDAY NIGHT IS CALLING, AND IT'S NOT ASKING NICELY.</strong> NO SLEEP NOV21 IS THE PARTY EVERYONE IS GONNA BE TALKING ABOUT. IF YOU WANT A NIGHT THAT ACTUALLY GOES CRAZY, THIS IS WHERE YOU NEED TO BE.</p>
              <div className="event-detail-item">
                <strong>NYC</strong> — Location drops day of
              </div>
              <div className="event-detail-item">
                <strong>Friday, November 21</strong> — 9:00 PM until late
              </div>
              <div className="event-detail-item">
                <strong>HIGH SCHOOL ONLY</strong>
              </div>
              <div className="event-detail-item">
                <strong>Security on-site</strong> · <strong>Bag checks at entry</strong>
              </div>
              <div className="event-detail-item">
                <strong>NO DRINKING. NO DRUGS. NO VAPES.</strong>
              </div>
            </div>
          </div>

          {/* Right Side - Ticket Selection */}
          <div className="ticket-right-panel">
            <div className="ticket-selection-modern">
              <h2 className="ticket-selection-title">Choose Your Ticket</h2>
              
              <div className="ticket-options-grid">
                <label className={`ticket-card-modern ${tier === "ga" ? "selected" : ""}`}>
                  <input 
                    type="radio" 
                    name="tier" 
                    value="ga" 
                    checked={tier === "ga"} 
                    onChange={() => setTier("ga")} 
                    className="ticket-radio-hidden"
                  />
                  <div className="ticket-radio-custom"></div>
                  <div className="ticket-card-content">
                    <div className="ticket-card-header">
                      <strong className="ticket-name">General Admission</strong>
                      <span className="ticket-price">$41.41</span>
                    </div>
                    <div className="ticket-description">Standard entry</div>
                  </div>
            </label>

                <label className={`ticket-card-modern vip-card-modern ${tier === "vip" ? "selected" : ""}`}>
                  <input 
                    type="radio" 
                    name="tier" 
                    value="vip" 
                    checked={tier === "vip"} 
                    onChange={() => setTier("vip")} 
                    className="ticket-radio-hidden"
                  />
                  <div className="ticket-radio-custom"></div>
                  <div className="ticket-card-content">
                    <div className="ticket-card-header">
                      <div className="ticket-header-left">
                        <strong className="ticket-name">VIP - Skip The Line</strong>
                        <div className="limited-badge-modern">LIMITED</div>
                      </div>
                      <span className="ticket-price">$67.67</span>
                    </div>
                    <div className="ticket-description">Fast-track entry · Priority access</div>
                  </div>
            </label>
          </div>

              <div className="quantity-selector-modern">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    type="button"
                    onClick={() => {
                      if (qty > 1) setQty(qty - 1);
                    }}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
              <input
                    className="quantity-input-modern"
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
                  <button 
                    className="quantity-btn"
                    type="button"
                    onClick={() => {
                      if (qty < 10) setQty(qty + 1);
                    }}
                    disabled={qty >= 10}
                  >
                    +
                  </button>
                </div>
                <div className="quantity-limit">Max 10 per order</div>
          </div>

              <button className="checkout-btn-modern" onClick={buy} disabled={loading}>
                <span className="checkout-text">
                  {loading ? "Processing..." : "Checkout"}
                </span>
                <span className="checkout-price">${(PRICES[tier] * qty).toFixed(2)}</span>
          </button>

              <div className="ticket-footer-modern">
                <div className="ticket-links-modern">
                  <a href="/terms">Terms</a>
                  <span className="link-separator">·</span>
                  <a href="/refunds">Refunds</a>
                </div>
                <p className="ticket-disclaimer-modern">
                  By purchasing, you agree to our Terms. High school only. No alcohol/drugs. Violations = removal without refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-links">
          <a href="/about">About</a> · <a href="/terms">Terms</a> · <a href="/refunds">Refunds</a>
        </div>
        <div>&copy; {new Date().getFullYear()} NO SLEEP NOV21</div>
      </footer>
      
      <StatusIndicator />
    </>
  );
}
