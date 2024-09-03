import axios from "axios";
import dotenv from "dotenv";
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
