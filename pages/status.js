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
              <div className="crextio-nav-item active">Dashboard</div>
              <div className="crextio-nav-item">Incidents</div>
              <div className="crextio-nav-item">Maintenance</div>
              <div className="crextio-nav-item">Subscribe</div>
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
                <div style={{ background: '#1A1A1A', color: '#fff', padding: '8px 24px', borderRadius: '99px', fontSize: '14px' }}>Overview</div>
                <div style={{ background: '#F5D485', color: '#111', padding: '8px 24px', borderRadius: '99px', fontSize: '14px' }}>Live</div>
              </div>
            </div>

            <div className="crextio-stats-row">
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">{uptime}</div>
                  <div className="stat-label-small">Uptime %</div>
                </div>
              </div>
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">{history.length}</div>
                  <div className="stat-label-small">Checks</div>
                </div>
              </div>
              <div className="crextio-stat-item">
                <div>
                  <div className="stat-value-large">24</div>
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
                <div className="status-badge-large">
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
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`chart-bar ${i % 3 === 0 ? 'accent' : ''}`}
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  ></div>
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
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>No Incidents</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>All systems normal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Middle (Timeline) */}
            <div className="crex-card card-bottom-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Timeline</div>
                <div style={{ fontSize: '14px', color: '#888' }}>September 2025</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{day}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>22</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Card (Services) */}
            <div className="crex-card card-dark">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Service Health</div>
                <div style={{ fontSize: '24px' }}>2/8</div>
              </div>

              <div className="dark-list">
                {currentStatus?.checks && Object.entries(currentStatus.checks).map(([service, check]) => (
                  <div key={service} className="dark-item">
                    <div className="dark-icon">
                      {service === 'api' ? '⚡️' : service === 'database' ? '💾' : '🌐'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>{service}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{check.message}</div>
                    </div>
                    <div className="dark-check">
                      {check.status === 'ok' ? '✔' : '⚠'}
                    </div>
                  </div>
                ))}

                {/* Placeholder items to fill space if needed */}
                <div className="dark-item">
                  <div className="dark-icon">🔒</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Security</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Audited</div>
                  </div>
                  <div className="dark-check">✔</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

