import pkg from "whatsapp-web.js";
import os from "os";
import path from "path";

const { Client, LocalAuth } = pkg;

const sessionPath = path.join(os.tmpdir(), "whatsapp-session");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: sessionPath
  }),
  puppeteer: {
    headless: "new",
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process"
    ],
    timeout: 120000
  }
});

client.on("qr", (qr) => {
  console.log("Scan QR:");
  console.log(
    "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" +
      encodeURIComponent(qr)
  );
});

client.on("ready", () => {
  console.log("WhatsApp Client is Ready!");
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated successfully");
});

client.on("auth_failure", (msg) => {
  console.error("AUTH FAILURE:", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out:", reason);
});

client.initialize();

export default client;