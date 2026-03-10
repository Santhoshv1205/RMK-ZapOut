import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import express from "express";

const { Client, LocalAuth } = pkg;

// --- Express server to serve QR code in browser ---
const app = express();
let latestQR = null;
let isReady = false;

app.get("/qr", async (req, res) => {
  if (isReady) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp QR</title>
          <meta charset="UTF-8"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #0a0f0a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: 'Courier New', monospace;
            }
            .card {
              background: #111811;
              border: 1px solid #25d36633;
              border-radius: 16px;
              padding: 48px;
              text-align: center;
              box-shadow: 0 0 60px #25d36622;
            }
            .icon { font-size: 64px; margin-bottom: 16px; }
            h1 { color: #25d366; font-size: 24px; margin-bottom: 8px; }
            p { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>WhatsApp Connected!</h1>
            <p>Your client is ready and online.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!latestQR) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp QR</title>
          <meta charset="UTF-8"/>
          <meta http-equiv="refresh" content="3"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #0a0f0a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: 'Courier New', monospace;
            }
            .card {
              background: #111811;
              border: 1px solid #25d36633;
              border-radius: 16px;
              padding: 48px;
              text-align: center;
              box-shadow: 0 0 60px #25d36622;
            }
            .spinner {
              width: 48px; height: 48px;
              border: 3px solid #25d36633;
              border-top-color: #25d366;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h1 { color: #25d366; font-size: 20px; margin-bottom: 8px; }
            p { color: #555; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h1>Initializing WhatsApp...</h1>
            <p>QR code is being generated. Page will refresh automatically.</p>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const qrDataURL = await qrcode.toDataURL(latestQR, {
      width: 400,
      margin: 3,
      color: { dark: "#000000", light: "#ffffff" }
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp QR Code</title>
          <meta charset="UTF-8"/>
          <meta http-equiv="refresh" content="30"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #0a0f0a;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: 'Courier New', monospace;
            }
            .card {
              background: #111811;
              border: 1px solid #25d36644;
              border-radius: 20px;
              padding: 48px 40px;
              text-align: center;
              box-shadow: 0 0 80px #25d36622, 0 0 30px #25d36611;
              max-width: 480px;
              width: 100%;
            }
            .logo { font-size: 36px; margin-bottom: 8px; }
            h1 {
              color: #25d366;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .subtitle {
              color: #555;
              font-size: 13px;
              margin-bottom: 28px;
            }
            .qr-wrapper {
              background: #fff;
              border-radius: 12px;
              padding: 16px;
              display: inline-block;
              box-shadow: 0 0 40px #25d36633;
            }
            img { display: block; border-radius: 4px; }
            .refresh-note {
              margin-top: 20px;
              color: #444;
              font-size: 12px;
            }
            .dot {
              display: inline-block;
              width: 8px; height: 8px;
              background: #25d366;
              border-radius: 50%;
              margin-right: 6px;
              animation: pulse 1.5s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
            .status {
              display: flex;
              align-items: center;
              justify-content: center;
              color: #25d366;
              font-size: 13px;
              margin-top: 18px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">📱</div>
            <h1>WHATSAPP LOGIN</h1>
            <p class="subtitle">Open WhatsApp → Linked Devices → Link a Device</p>
            <div class="qr-wrapper">
              <img src="${qrDataURL}" width="300" height="300" alt="QR Code"/>
            </div>
            <div class="status">
              <span class="dot"></span> Waiting for scan...
            </div>
            <p class="refresh-note">QR refreshes automatically every 30 seconds</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error generating QR: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ QR Code page running at: http://localhost:${PORT}/qr`);
});

// --- WhatsApp Client ---
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
  console.log(`📱 QR Code ready! Open: http://localhost:${PORT}/qr`);
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
  console.error("❌ Auth failure:", msg);
});

client.on("disconnected", (reason) => {
  isReady = false;
  console.warn("⚠️ Disconnected:", reason);
});

client.initialize();

export default client;