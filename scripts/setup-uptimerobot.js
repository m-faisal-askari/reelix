import "dotenv/config";

/**
 * UptimeRobot Monitor Setup Script
 * Usage:
 *   node scripts/setup-uptimerobot.js <UPTIMEROBOT_API_KEY> <BACKEND_URL>
 * or set UPTIMEROBOT_API_KEY and BACKEND_URL in your environment.
 */

const apiKey = process.argv[2] || process.env.UPTIMEROBOT_API_KEY;
const backendUrl = process.argv[3] || process.env.BACKEND_URL;

if (!apiKey || !backendUrl) {
  console.log(`
Usage:
  node scripts/setup-uptimerobot.js <UPTIMEROBOT_API_KEY> <BACKEND_URL>

Example:
  node scripts/setup-uptimerobot.js u1234567-abcdef https://reelix-backend.onrender.com/
`);
  process.exit(1);
}

const normalizedUrl = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;

async function createMonitor() {
  try {
    console.log(`Setting up 24/7 monitor for: ${normalizedUrl}...`);

    const params = new URLSearchParams({
      api_key: apiKey,
      format: "json",
      type: "1", // 1 = HTTP(s)
      url: normalizedUrl,
      friendly_name: "Reelix Backend (24/7 Keep-Alive)",
      interval: "300", // 300 seconds = 5 minutes
    });

    const response = await fetch("https://api.uptimerobot.com/v2/newMonitor", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (result.stat === "ok") {
      console.log("✅ Success! Monitor created on UptimeRobot.");
      console.log(`Monitor ID: ${result.monitor.id}`);
      console.log("Your backend will now be pinged every 5 minutes to prevent sleeping.");
    } else {
      console.error("❌ Failed to create monitor:", result.message || result);
    }
  } catch (error) {
    console.error("Error creating UptimeRobot monitor:", error.message);
  }
}

createMonitor();
