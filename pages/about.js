import { useState, useEffect } from "react";

// Audio Equalizer Graphic Component
function AudioEqualizer() {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const barCount = 15;
    const newBars = Array.from({ length: barCount }, () => ({
      height: Math.random() * 80 + 20,
      delay: Math.random() * 0.5,
    }));
    setBars(newBars);

    const interval = setInterval(() => {
      setBars(prevBars => prevBars.map(() => ({
        height: Math.random() * 80 + 20,
        delay: Math.random() * 0.5,
      })));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="equalizer-graphic">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="equalizer-bar"
          style={{
            height: `${bar.height}%`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">ABOUT</h1>
          
          <div className="about-text-section">
            <AudioEqualizer />
            <div className="about-text">
              <p>
                As part of the global <strong className="live-nation-text">NO SLEEP</strong> Entertainment network, 
                NO SLEEP leverages its vast experience and industry connections to bring top-tier entertainment 
                to the region. Our dedication to exceptional live experiences is evident in the meticulous planning 
                and execution of events that cater to diverse audiences.
              </p>
              <p>
                We create unforgettable nights filled with music, energy, and non-stop excitement. Every event 
                is carefully curated to deliver the ultimate party experience, bringing together the best artists, 
                DJs, and performers in an atmosphere that's second to none.
              </p>
            </div>
          </div>

          <div className="about-crowd-section">
            <div className="crowd-image-overlay"></div>
          </div>

          <div className="project-details">
            <div className="detail-item">
              <span className="detail-label">Design</span>
              <span className="detail-separator"></span>
              <span className="detail-value">Website Redesign</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-separator"></span>
              <span className="detail-value">New York</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date</span>
              <span className="detail-separator"></span>
              <span className="detail-value">2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

