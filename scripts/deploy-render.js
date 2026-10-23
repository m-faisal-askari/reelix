import fs from "fs";
import path from "path";

const RENDER_API_KEY = "rnd_R2fvvXX2Is0EeGPrF5fgED30u72n";
const UPTIMEROBOT_KEY = "u3874642-92da92f27f9531179741cf2f";
const OWNER_ID = "tea-dbcv2fifngtc73b4bdvg";
const REPO_URL = "https://github.com/m-faisal-askari/reelix";

// 1. Parse server/.env
const envPath = path.resolve("server/.env");
let envVarsList = [];

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key) {
        envVarsList.push({ key, value });
      }
    }
  });
}

// Add NODE_ENV production if not present
if (!envVarsList.find((e) => e.key === "NODE_ENV")) {
  envVarsList.push({ key: "NODE_ENV", value: "production" });
}

console.log(`Parsed ${envVarsList.length} environment variables from server/.env`);

async function renderFetch(endpoint, options = {}) {
  const url = `https://api.render.com/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${RENDER_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Render API Error (${res.status} ${res.statusText}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  try {
    console.log("Checking existing Render services...");
    const services = await renderFetch(`/services?ownerId=${OWNER_ID}`);
    let service = services.find((s) => s.service?.name === "reelix-backend")?.service;

    if (!service) {
      console.log("Creating web service 'reelix-backend' on Render...");
      const newService = await renderFetch("/services", {
        method: "POST",
        body: JSON.stringify({
          type: "web_service",
          name: "reelix-backend",
          ownerId: OWNER_ID,
          repo: REPO_URL,
          branch: "main",
          rootDir: "server",
          autoDeploy: "yes",
          serviceDetails: {
            env: "node",
            plan: "free",
            region: "oregon",
            healthCheckPath: "/",
            envSpecificDetails: {
              buildCommand: "npm install",
              startCommand: "npm start",
            },
          },
        }),
      });
      service = newService.service || newService;
      console.log(`✅ Service created successfully! Service ID: ${service.id}`);
    } else {
      console.log(`Found existing service ID: ${service.id}`);
    }

    const serviceId = service.id;

    // Set Environment Variables
    console.log("Setting environment variables on Render...");
    await renderFetch(`/services/${serviceId}/env-vars`, {
      method: "PUT",
      body: JSON.stringify(envVarsList),
    });
    console.log("✅ Environment variables set successfully!");

    // Trigger a fresh deployment
    console.log("Triggering deployment...");
    const deploy = await renderFetch(`/services/${serviceId}/deploys`, {
      method: "POST",
      body: JSON.stringify({ clearCache: "do_not_clear" }),
    });
    console.log(`✅ Deployment initiated! Deploy ID: ${deploy.id}`);

    // Fetch the latest service details to get URL
    const latestService = await renderFetch(`/services/${serviceId}`);
    const serviceUrl =
      latestService.serviceDetails?.url ||
      service.serviceDetails?.url ||
      `https://${service.slug || "reelix-backend"}.onrender.com`;

    console.log(`\n🎉 Live Service URL: ${serviceUrl}`);

    // Set up UptimeRobot
    console.log("\nConfiguring UptimeRobot 24/7 monitor...");
    const pingUrl = serviceUrl.endsWith("/") ? serviceUrl : `${serviceUrl}/`;

    const uptimeParams = new URLSearchParams({
      api_key: UPTIMEROBOT_KEY,
      format: "json",
      type: "1", // HTTP(s)
      url: pingUrl,
      friendly_name: "Reelix Backend (24/7 Keep-Alive)",
      interval: "300", // 5 minutes
    });

    const uptimeRes = await fetch("https://api.uptimerobot.com/v2/newMonitor", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: uptimeParams.toString(),
    });

    const uptimeData = await uptimeRes.json();
    if (uptimeData.stat === "ok") {
      console.log("✅ UptimeRobot monitor successfully created!");
      console.log(`Monitor ID: ${uptimeData.monitor?.id}`);
      console.log(`Ping Target: ${pingUrl} every 5 minutes`);
    } else {
      console.log("UptimeRobot response:", uptimeData.message || uptimeData);
    }

    console.log("\nAll done!");
  } catch (err) {
    console.error("❌ Process failed:", err.message);
  }
}

run();
