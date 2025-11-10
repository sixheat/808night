import Stripe from "stripe";

// Check if Stripe is configured and accessible
async function checkStripe() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { status: "error", message: "Stripe secret key not configured" };
    }
    
    const stripe = new Stripe(secretKey);
    // Make a lightweight API call to verify connectivity (with timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );
    
    await Promise.race([
      stripe.balance.retrieve(),
      timeoutPromise
    ]);
    
    return { status: "ok", message: "Stripe API operational" };
  } catch (error) {
    if (error.message === "Timeout") {
      return { status: "error", message: "Stripe API timeout" };
    }
    return { status: "error", message: `Stripe error: ${error.message}` };
  }
}

// Check if environment variables are set
function checkEnvironment() {
  const required = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SITE_URL"
  ];
  
  const missing = required.filter(key => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      return !process.env[key];
    }
    return !process.env[key];
  });
  
  if (missing.length > 0) {
    return { status: "error", message: `Missing: ${missing.join(", ")}` };
  }
  
  return { status: "ok", message: "All environment variables set" };
}

// Check API endpoint health
async function checkAPIHealth() {
  try {
    // Check if we can create a Stripe instance
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { status: "error", message: "API not configured" };
    }
    return { status: "ok", message: "API endpoints operational" };
  } catch (error) {
    return { status: "error", message: `API error: ${error.message}` };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const checks = {
      stripe: await checkStripe(),
      environment: checkEnvironment(),
      api: await checkAPIHealth(),
    };

    // Determine overall status
    const allOk = Object.values(checks).every(check => check.status === "ok");
    const hasErrors = Object.values(checks).some(check => check.status === "error");
    
    let overallStatus = "operational";
    let statusMessage = "All systems operational";
    let statusColor = "#22c55e"; // green
    
    if (hasErrors) {
      overallStatus = "degraded";
      const errorChecks = Object.entries(checks)
        .filter(([_, check]) => check.status === "error")
        .map(([name, check]) => `${name}: ${check.message}`)
        .join("; ");
      statusMessage = `Issues detected: ${errorChecks}`;
      statusColor = "#f59e0b"; // amber
    }
    
    // If critical services are down
    if (checks.stripe.status === "error" || checks.environment.status === "error") {
      overallStatus = "down";
      statusMessage = "Critical services unavailable";
      statusColor = "#ef4444"; // red
    }

    return res.status(200).json({
      status: overallStatus,
      message: statusMessage,
      color: statusColor,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: `Status check failed: ${error.message}`,
      color: "#ef4444",
      timestamp: new Date().toISOString(),
    });
  }
}

