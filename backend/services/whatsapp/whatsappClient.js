import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const client = new Client({
authStrategy: new LocalAuth({
dataPath: "/app/whatsapp-session"
}),
puppeteer: {
headless: "new",
args: [
"--no-sandbox",
"--disable-setuid-sandbox",
"--disable-dev-shm-usage",
"--disable-gpu",
"--disable-features=IsolateOrigins,site-per-process"
],
timeout: 120000
}
});

client.on("qr", (qr) => {
console.log("Open this QR in browser and scan with WhatsApp:");
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
