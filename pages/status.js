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
          // Keep last 90 data points (representing ~15 minutes if checking every 10 seconds)
          const updated = [...prev, newEntry].slice(-90);
          return updated;
        });
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 10 seconds
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
      case "operational": return "Operational";
      case "degraded": return "Degraded Performance";
      case "down": return "Service Unavailable";
      default: return "Unknown";
    }
  };

  // Generate graph data
  const generateGraph = (data) => {
    if (!data || data.length === 0) return [];
    
    const segments = data.map((entry, index) => {
      const status = entry.status;
      const color = getStatusColor(status);
      return { color, status, index };
    });
    
    return segments;
  };

  const graphData = generateGraph(history);
  const overallStatus = currentStatus?.status || "checking";
  const overallColor = getStatusColor(overallStatus);

  return (
    <>
      <Head>
        <title>System Status - 808night</title>
        <meta name="description" content="Real-time system status and uptime monitoring" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#eee", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "40px", textAlign: "center" }}>
            <h1 style={{ fontSize: "48px", margin: "0 0 10px", color: "#ff4d4d" }}>System Status</h1>
            <p style={{ color: "#ff9d9d", fontSize: "18px" }}>Real-time monitoring and uptime history</p>
          </div>

          {/* Overall Status Banner */}
          <div style={{
            background: overallColor === "#22c55e" ? "rgba(34, 197, 94, 0.1)" : overallColor === "#f59e0b" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `2px solid ${overallColor}`,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "40px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: overallColor, marginBottom: "8px" }}>
              {getStatusText(overallStatus)}
            </div>
            <div style={{ color: "#ff9d9d", fontSize: "14px" }}>
              {currentStatus?.message || "Checking system status..."}
            </div>
          </div>

          {/* Uptime Graph */}
          {history.length > 0 && (
            <div style={{ background: "#260000", border: "1px solid #330000", borderRadius: "12px", padding: "24px", marginBottom: "40px" }}>
              <h2 style={{ color: "#ff9d9d", marginBottom: "20px", fontSize: "20px" }}>Uptime History</h2>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "60px", marginBottom: "12px" }}>
                {graphData.map((segment, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: segment.status === "operational" ? "100%" : segment.status === "degraded" ? "70%" : "40%",
                      background: segment.color,
                      borderRadius: "2px",
                      minWidth: "4px",
                      opacity: 0.9,
                      transition: "all 0.2s ease"
                    }}
                    title={`${new Date(history[index]?.timestamp).toLocaleTimeString()}: ${getStatusText(segment.status)}`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#ff8b8b" }}>
                <span>{history.length > 0 ? new Date(history[0].timestamp).toLocaleTimeString() : "Start"}</span>
                <span>Now</span>
              </div>
            </div>
          )}

          {/* Service Status Details */}
          {currentStatus?.checks && (
            <div style={{ background: "#260000", border: "1px solid #330000", borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ color: "#ff9d9d", marginBottom: "20px", fontSize: "20px" }}>Service Status</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {Object.entries(currentStatus.checks).map(([service, check]) => {
                  const color = check.status === "ok" ? "#22c55e" : "#ef4444";
                  return (
                    <div key={service} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "#1a0000",
                      borderRadius: "8px",
                      border: `1px solid ${color}40`
                    }}>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#ff9d9d", textTransform: "capitalize", marginBottom: "4px" }}>
                          {service}
                        </div>
                        <div style={{ fontSize: "12px", color: "#ff8b8b" }}>
                          {check.message}
                        </div>
                      </div>
                      <div style={{
                        padding: "6px 12px",
                        background: color === "#22c55e" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: color,
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {check.status === "ok" ? "Operational" : "Error"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back Link */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a href="/" style={{ color: "#ff4d4d", textDecoration: "none", fontSize: "16px" }}>
              ← Back to Home
            </a>
          </div>

          {/* Last Updated */}
          {currentStatus?.timestamp && (
            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#ff8b8b" }}>
              Last updated: {new Date(currentStatus.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

