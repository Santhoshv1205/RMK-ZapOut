import client from './whatsappClient.js';

export const sendWhatsAppMessage = async (number, message) => {
    try {
        // Remove any non-digit characters
        let cleanNumber = number.replace(/\D/g, "");

        // Prepend "91" if number is exactly 10 digits
        if (cleanNumber.length === 10) {
            cleanNumber = "91" + cleanNumber;
        }

        const chatId = `${cleanNumber}@c.us`;

        await client.sendMessage(chatId, message);
        console.log("Message sent to:", cleanNumber);
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
};