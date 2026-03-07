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

client.initialize();

export default client;