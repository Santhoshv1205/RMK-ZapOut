import pkg from "whatsapp-web.js";
import os from "os";
import path from "path";

const { Client, LocalAuth } = pkg;

const sessionPath = "./whatsapp-session";

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: sessionPath
  }),
  puppeteer: {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("Scan this QR:");
  console.log(
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(qr)
  );
});

client.on("ready", () => {
  console.log("WhatsApp Client is READY");
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("AUTH FAILURE:", msg);
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
});

client.initialize();

export default client;