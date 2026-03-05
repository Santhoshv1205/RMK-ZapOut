import client from "../services/whatsapp/whatsappClient.js";

export const sendTestMessage = async (req, res) => {
  try {

    const number = "919487769772@c.us"; // replace with your phone

    await client.sendMessage(
      number,
      "Test message from RMK ZapOut 🚀"
    );

    res.json({ success: true, message: "WhatsApp message sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};