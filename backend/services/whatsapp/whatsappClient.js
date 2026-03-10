import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

// Shared state - imported by server.js
export let latestQR = null;
export let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./sessions"
  }),
  puppeteer: {
    headless: true,
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  }
});

client.on("qr", (qr) => {
  latestQR = qr;
  isReady = false;
  console.log("📱 New QR Code generated. Visit /qr to scan.");
});

client.on("ready", () => {
  isReady = true;
  latestQR = null;
  console.log("✅ WhatsApp Client is Ready!");
});

client.on("authenticated", () => {
  console.log("🔐 WhatsApp Authenticated!");
});

client.on("auth_failure", (msg) => {
  isReady = false;
  console.error("❌ Auth failure:", msg);
});

client.on("disconnected", (reason) => {
  isReady = false;
  console.warn("⚠️ Disconnected:", reason);
});

client.initialize();

export default client;