import client from "./whatsappClient.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sendWhatsAppMessage = async (number, message) => {
  try {
    if (!client || !client.info) {
      console.log("WhatsApp client not ready yet");
      return;
    }

    let cleanNumber = number.replace(/\D/g, "");

    if (cleanNumber.length === 10) {
      cleanNumber = "91" + cleanNumber;
    }

    const chatId = `${cleanNumber}@c.us`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {

        await client.sendMessage(chatId, message);

        console.log("WhatsApp message sent to:", cleanNumber);
        return;

      } catch (err) {

        console.log(`Send attempt ${attempt} failed`);

        if (attempt === 3) {
          throw err;
        }

        await delay(3000);
      }
    }

  } catch (error) {
    console.error("Error sending WhatsApp message:", error.message);
  }
};