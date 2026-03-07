import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./.wwebjs_auth"
  }),
  puppeteer: {
    headless: true,
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
  console.log("Scan this QR with WhatsApp:");

  console.log(
    "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" +
      encodeURIComponent(qr)
  );
});

client.on("ready", () => {
  console.log("WhatsApp Client is READY");
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated successfully");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failure:", msg);
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
});

client.initialize();

export default client;