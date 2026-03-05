import client from "../services/whatsapp/whatsappClient.js";

export const sendTestMessage = async (req, res) => {
  try {

    if (!client.info) {
      return res.json({ error: "WhatsApp client not ready yet" });
    }

    const number = "919487769772@c.us";

    const message = await client.sendMessage(
      number,
      "Test message from RMK ZapOut 🚀"
    );

    return res.json({
      success: true,
      message: "WhatsApp message sent",
      id: message.id._serialized
    });

  } catch (error) {
    console.error("WhatsApp error:", error);
    return res.status(500).json({
      error: "Failed to send message",
      details: error.message
    });
  }
};