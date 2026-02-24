import client from './whatsappClient.js';

export const sendWhatsAppMessage = async (number, message) => {
    try {
        const cleanNumber = number.replace(/\D/g, "");
        const chatId = `${cleanNumber}@c.us`;

        await client.sendMessage(chatId, message);
        console.log("Message sent to:", cleanNumber);

    } catch (error) {
        console.error("Error sending message:", error.message);
    }
};