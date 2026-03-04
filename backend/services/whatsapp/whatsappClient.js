import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: "new",   // important for newer Node versions
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-features=IsolateOrigins,site-per-process"
        ],
        timeout: 60000
    }
});

client.on('qr', (qr) => {
    console.log('Scan this QR code:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is Ready!');
});

client.on('auth_failure', msg => {
    console.error('AUTH FAILURE:', msg);
});

client.on('disconnected', reason => {
    console.log('Client was logged out:', reason);
});

client.initialize();

export default client;