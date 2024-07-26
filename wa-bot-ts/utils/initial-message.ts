import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "./../.env" });

import { summaryMessage } from "./message";
import { ButtonMessage, sendInteractiveMessage } from "./message-sender";

const { GRAPH_API_TOKEN } = process.env;
const vio = ["6281231080808"];
// const numbers: string[] = ["4915237363126", "4915901993904", "4917634685672", "4915256917547"];
const numbers: string[] = ["4915237363126"];
const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";

async function sendWhatsAppMessages(number: string): Promise<void> {
  if (GRAPH_API_TOKEN === undefined) {
    console.error("API_TOKEN not found.");
    return;
  }

  const headers = {
    Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = {
    messaging_product: "whatsapp",
    to: number,
    type: "template",
    template: {
      name: "template_hello_1_test",
      language: {
        code: "id",
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "text",
              text: "Ricky & Glo",
            },
          ],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: "Aaron Randy" },
            { type: "text", text: "Ricky & Glo" },
            { type: "text", text: "Mr. Papa & Mama" },
            { type: "text", text: "Mr. Papi & Mami" },
            { type: "text", text: "Nama Hari, 01/01/2024" },
            { type: "text", text: "Nama Gereja, Kota" },
            { type: "text", text: "00:00" },
            { type: "text", text: "Nama Tempat, Kota" },
            { type: "text", text: "00:00" },
            { type: "text", text: "2" },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: "/",
            },
          ],
        },
      ],
    },
  };

  try {
    console.log(JSON.stringify(body, null, 2));
    const firstResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      body,
      { headers }
    );
    console.log(
      "First message sent successfully. Response:",
      JSON.stringify(firstResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Failed to send first message. Error:",
      (error as any).response ? (error as any).response.data : (error as Error).message
    );
  }
}

// Example usage:
// numbers.map(async (number) => await sendWhatsAppMessages(number));
numbers.map(async (number) => {
  const buttons: ButtonMessage[] = [
    {
      type: "reply",
      reply: {
        id: `#reply-reset-1`,
        title: "YA",
      },
    },
    {
      type: "reply",
      reply: {
        id: `#reply-reset-2`,
        title: "TIDAK",
      },
    },
  ];
  await sendInteractiveMessage(
    BUSINESS_PHONE_NUMBER_ID,
    number,
    summaryMessage(false, 0, false, 0, ""),
    buttons
  );
});
