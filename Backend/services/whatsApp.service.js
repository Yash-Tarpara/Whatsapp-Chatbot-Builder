import axios from "axios";
import projectModel from "../models/project.model.js";

// Securely fetch the credentials for the project
async function getProjectCredentials(projectId) {
  const project = await projectModel
    .findById(projectId)
    .select("whatsappPhoneNumberId whatsappAccessToken");

  if (
    !project ||
    !project.whatsappPhoneNumberId ||
    !project.whatsappAccessToken
  ) {
    throw new Error(
      `WhatsApp credentials not configured for project ${projectId}`
    );
  }

  return {
    phoneNumberId: project.whatsappPhoneNumberId,
    accessToken: project.whatsappAccessToken,
  };
}

// Send a text message to the user via WhatsApp API
export async function sendWhatsappMessage({to, text, projectId}) {
  // if (process.env.NODE_ENV === "development") {
  //   console.log(`[MOCK] Sending WhatsApp message"`);
  //   return;
  // }
  try {
    const {phoneNumberId, accessToken} = await getProjectCredentials(projectId);

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {body: text},
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, payload, {headers});

    console.log("Message sent to", to, "::", response.data);
    return response.data;
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error("Error sending WhatsApp message:", errData);
    throw error;
  }
}
