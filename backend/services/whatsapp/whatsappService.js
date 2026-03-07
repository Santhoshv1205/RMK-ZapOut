import client from "./whatsappClient.js";

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

    const isRegistered = await client.isRegisteredUser(chatId);

    if (!isRegistered) {
      console.log("Number not on WhatsApp:", cleanNumber);
      return;
    }

    await client.sendMessage(chatId, message);

    console.log("WhatsApp message sent to:", cleanNumber);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};  