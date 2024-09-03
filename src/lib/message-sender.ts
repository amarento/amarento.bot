import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import fs from "fs";
import { Header } from "whatsapp-api-js/messages";
dotenv.config();

const { GRAPH_API_TOKEN } = process.env;

if (GRAPH_API_TOKEN === undefined) {
  console.error("GRAPH_API_TOKEN not defined.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${GRAPH_API_TOKEN}`,
  "Content-Type": "application/json",
};

export type ButtonMessage = {
  type: string;
  reply?: {
    id: string;
    title: string;
  };
  parameters?: { display_text: string; url: string }[];
};

/** send interactive button message */
export async function sendInteractiveButtonMessage(
  business_phone_number_id: string,
  to: string,
  message: string,
  buttons: ButtonMessage[],
  header?: Header
) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: headers,
    data: {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        header: header,
        body: {
          text: message,
        },
        action: {
          buttons: buttons,
        },
      },
    },
  });
}

/** upload media to whatsapp api.
 * see: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/
 */
export async function uploadMedia(
  business_phone_number_id: string,
  file: string
) {
  try {
    const data = new FormData();
    data.append("file", fs.createReadStream(file));
    data.append("type", "image/png");
    data.append("messaging_product", "whatsapp");

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${business_phone_number_id}/media`,
      data,
      {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          ...data.getHeaders(),
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
    console.error(
      `Failed to upload media. Error:`,
      (error as any).response
        ? (error as any).response.data
        : (error as Error).message
    );
  }
}
