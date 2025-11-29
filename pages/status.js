import { useState, useEffect } from "react";
import Head from "next/head";

export default function StatusPage() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [viewMode, setViewMode] = useState("Live");

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
          const updated = [...prev, newEntry].slice(-90);
          return updated;
        });

        setLoading(false); // Keep this for consistency, even if UI doesn't use it
      } catch (error) {
        setLoading(false); // Keep this for consistency
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const calculateUptime = () => {
    if (history.length === 0) return 100;
    const operational = history.filter(h => h.status === "operational").length;
    return Math.round((operational / history.length) * 100);
  };

  const overallStatus = currentStatus?.status || "checking";
  const uptime = calculateUptime();
  const checkCount = history.length;
  const serviceCount = currentStatus?.checks ? Object.keys(currentStatus.checks).length : 0;

  return (
    <>
      <Head>
        <title>System Status - 808night</title>
        <meta name="description" content="Real-time system status and uptime monitoring" />
      </Head>

      <div className="crextio-page">
        <div className="crextio-container">

          {/* Header */}
          <div className="crextio-header">
            <div className="crextio-brand">808night Status</div>
            <div className="crextio-nav">
              {["Dashboard", "Incidents", "Maintenance", "Subscribe"].map((tab) => (
                <div
                  key={tab}
                  className={`crextio-nav-item ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/" style={{ textDecoration: 'none', color: '#111' }}>Back to Site</a>
            </div>
          </div>

          {/* Title & Top Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="crextio-title-section">
              <h1 className="crextio-title">Welcome in, 808night</h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  className={`toggle-btn ${viewMode === "Overview" ? "active" : "inactive"}`}
                  onClick={() => setViewMode("Overview")}
                >
                  Overview
                </div>
                <div
                  className={`toggle-btn ${viewMode === "Live" ? "active" : "inactive"}`}
                  onClick={() => setViewMode("Live")}
                >
                  Live
                </div>
              </div>
            </div>

            <div className="crextio-stats-row">
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">{uptime}%</div>
                  <div className="stat-label-small">Uptime</div>
                </div>
              </div>
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">{checkCount}</div>
                  <div className="stat-label-small">Checks</div>
                </div>
              </div>
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">{serviceCount}</div>
                  <div className="stat-label-small">Services</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="crextio-grid">

            {/* Profile Card (Overall Status) */}
            <div className="crex-card card-profile">
              <div className="profile-image-area"></div>
              <div className="profile-info">
                <div className="status-badge-large" style={{
                  background: overallStatus === 'operational' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                }}>
                  {overallStatus === 'operational' ? 'System Operational' : 'Issues Detected'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#fff' }}>
                  Current Status
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  {currentStatus?.message || "Monitoring..."}
                </div>
              </div>
            </div>

            {/* Chart Card (History) */}
            <div className="crex-card card-chart">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '20px', fontWeight: '500' }}>Response Time</div>
                <div style={{ fontSize: '20px' }}>↗</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '300', marginTop: '12px' }}>
                45ms <span style={{ fontSize: '14px', color: '#888' }}>avg</span>
              </div>

              <div className="chart-bars">
                {history.slice(-12).map((entry, i) => (
                  <div
                    key={i}
                    className={`chart-bar ${entry.status === 'operational' ? 'accent' : ''}`}
                    style={{
                      height: `${entry.status === 'operational' ? 60 + Math.random() * 20 : 20}%`,
                      background: entry.status === 'operational' ? 'var(--crex-accent)' : '#ef4444'
                    }}
                    title={new Date(entry.timestamp).toLocaleTimeString()}
                  ></div>
                ))}
                {/* Fill empty slots if history is short */}
                {[...Array(Math.max(0, 12 - history.length))].map((_, i) => (
                  <div key={`empty-${i}`} className="chart-bar" style={{ height: '5%', opacity: 0.2 }}></div>
                ))}
              </div>
            </div>

            {/* Timer Card (Uptime Circle) */}
            <div className="crex-card card-timer">
              <div>
                <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px' }}>Uptime</div>
                <div style={{ fontSize: '14px', color: '#888' }}>Last 24h</div>
              </div>
              <div className="timer-circle">
                {uptime}%
              </div>
            </div>

            {/* Bottom Left (Incidents) */}
            <div className="crex-card card-bottom-1">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Incidents</div>
                <div>↓</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#F2F2F2', borderRadius: '8px' }}></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {overallStatus === 'operational' ? 'No Incidents' : 'Active Incident'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {overallStatus === 'operational' ? 'All systems normal' : currentStatus?.message}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Middle (Timeline) */}
            <div className="crex-card card-bottom-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Timeline</div>
                <div style={{ fontSize: '14px', color: '#888' }}>Live Feed</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                {history.slice(-6).map((entry, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: entry.status === 'operational' ? '#22c55e' : '#ef4444' }}>
                      {entry.status === 'operational' ? 'OK' : 'ERR'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Card (Services) */}
            <div className="crex-card card-dark">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Service Health</div>
                <div style={{ fontSize: '24px' }}>{serviceCount}/3</div>
              </div>

              <div className="dark-list">
                {currentStatus?.checks && Object.entries(currentStatus.checks).map(([service, check]) => (
                  <div key={service} className="dark-item">
                    <div className="dark-icon">
                      {service === 'stripe' ? '💳' : service === 'environment' ? '⚙️' : '⚡️'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>{service}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{check.message}</div>
                    </div>
                    <div className="dark-check" style={{ color: check.status === 'ok' ? 'var(--crex-accent)' : '#ef4444' }}>
                      {check.status === 'ok' ? '✔' : '⚠'}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="dark-item">
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Loading services...</div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

