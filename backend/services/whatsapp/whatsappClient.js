import pkg from "whatsapp-web.js";
import path from "path";
import os from "os";

const { Client, LocalAuth } = pkg;

const sessionPath = "./whatsapp-session";
const chromeProfile = path.join(os.tmpdir(), `chrome-${Date.now()}`);

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: sessionPath
  }),
  puppeteer: {
    headless: true,
    userDataDir: chromeProfile,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("Scan this QR:");
  console.log(
    "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" +
      encodeURIComponent(qr)
  );
});

client.on("ready", () => {
  console.log("WhatsApp Client READY");
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated");
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
});

client.initialize();

export default client;

