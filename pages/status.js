import { useState, useEffect } from "react";
import Head from "next/head";

export default function StatusPage() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setCurrentStatus(data);

        // Add to history
        setHistory(prev => {
          const newEntry = {
            timestamp: new Date().toISOString(),
            status: data.status,
            checks: data.checks,
          };
          // Keep last 90 data points
          const updated = [...prev, newEntry].slice(-90);
          return updated;
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "operational": return "#22c55e";
      case "degraded": return "#f59e0b";
      case "down": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "operational": return "All Systems Operational";
      case "degraded": return "Degraded Performance";
      case "down": return "Service Unavailable";
      default: return "Checking Status...";
    }
  };

  const calculateUptime = () => {
    if (history.length === 0) return 100;
    const operational = history.filter(h => h.status === "operational").length;
    return Math.round((operational / history.length) * 100);
  };

  const overallStatus = currentStatus?.status || "checking";
  const overallColor = getStatusColor(overallStatus);

  return (
    <>
      <Head>
        <title>System Status - 808night</title>
        <meta name="description" content="Real-time system status and uptime monitoring" />
      </Head>

      <div className="status-page-modern">
        <div className="status-container-modern">

          {/* Header */}
          <div className="status-header-modern">
            <h1 className="status-title-modern">System Status</h1>
            <p className="status-subtitle-modern">Real-time performance monitoring</p>
          </div>

          {/* Bento Grid */}
          <div className="status-grid">

            {/* Overview Card */}
            <div className="status-card card-overview">
              <div className="overview-status" style={{ color: overallColor }}>
                <div className="status-pulse-large" style={{ background: overallColor, boxShadow: `0 0 20px ${overallColor}` }}></div>
                {getStatusText(overallStatus)}
              </div>
              <div className="overview-message">
                {currentStatus?.message || "Monitoring system metrics..."}
              </div>
            </div>

            {/* Uptime Card */}
            <div className="status-card card-uptime">
              <div className="card-label">Uptime (Last 15m)</div>
              <div className="uptime-percentage">
                {calculateUptime()}%
              </div>
            </div>

          </div>

          {/* Services Grid */}
          <h2 className="status-subtitle-modern" style={{ marginBottom: '24px' }}>Service Health</h2>
          <div className="services-grid">
            {currentStatus?.checks && Object.entries(currentStatus.checks).map(([service, check]) => (
              <div key={service} className="service-card">
                <div className="service-info">
                  <span className="service-name">{service}</span>
                  <span className="service-status-text">{check.message}</span>
                </div>
                <div className={`status-pill ${check.status === 'ok' ? 'operational' : 'down'}`}>
                  {check.status === 'ok' ? 'Operational' : 'Error'}
                </div>
              </div>
            ))}
          </div>

          {/* History Graph */}
          {history.length > 0 && (
            <div className="status-card" style={{ marginTop: '40px' }}>
              <div className="card-label" style={{ marginBottom: '24px' }}>System Latency & Uptime History</div>
              <div className="history-graph-container">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="history-bar"
                    style={{
                      height: entry.status === "operational" ? "60%" : entry.status === "degraded" ? "40%" : "20%",
                      background: getStatusColor(entry.status),
                      opacity: (index + 1) / history.length // Fade effect
                    }}
                    title={`${new Date(entry.timestamp).toLocaleTimeString()}: ${entry.status}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} className="hover:text-white">
              ← Back to Home
            </a>
          </div>

        </div>
      </div>
    </>
  );
}

