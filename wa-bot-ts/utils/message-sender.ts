import axios from "axios";
import dotenv from "dotenv";
import { Header } from "whatsapp-api-js/messages";
dotenv.config();

const { GRAPH_API_TOKEN } = process.env;

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

export type CTAParameter = {
  display_text: string;
  url: string;
};

export type TemplateComponent = {
  type: string;
  parameters: { type: string; text: string }[];
  sub_type?: string;
  index?: number;
};

/** send template message */
export async function sendTemplateMessage(
  business_phone_number_id: string,
  to: string,
  templateName: string,
  components?: TemplateComponent[]
) {
  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/${business_phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "id",
          },
          components: components,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error(
      `Failed to send ${templateName}. Error:`,
      (error as any).response ? (error as any).response.data : (error as Error).message
    );
  }
}

/** send button type message */
export async function sendTextMessage(
  business_phone_number_id: string,
  to: string,
  message: string,
  messageId?: string
) {
  const data = messageId
    ? {
        messaging_product: "whatsapp",
        to: to,
        text: {
          body: message,
        },
        context: {
          message_id: messageId,
        },
      }
    : {
        messaging_product: "whatsapp",
        to: to,
        text: {
          body: message,
        },
      };

  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: headers,
    data: data,
  });
}

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

/** send interactive cta message */
export async function sendInteractiveCTAMessage(
  business_phone_number_id: string,
  to: string,
  message: string,
  parameter: CTAParameter
) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: headers,
    data: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "interactive",
      interactive: {
        type: "cta_url",
        header: {
          type: "text",
          text: "The Wedding of Ricky & Glo",
        },
        body: {
          text: message,
        },
        action: {
          name: "cta_url",
          parameters: parameter,
        },
      },
    },
  });
}

export async function markAsRead(business_phone_number_id: string, messageId: string) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: headers,
    data: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    },
  });
}

/** upload media to whatsapp api.
 * see: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/
 */
export async function uploadMedia(business_phone_number_id: string, file: string) {
  try {
    const form = new FormData();
    form.append("file", file);

    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/media`,
      headers: headers,
      data: {
        file: "helloworld",
        type: "text/plain",
        messaging_product: "whatsapp",
      },
    });
  } catch (error) {
    console.log(error);
    console.error(
      `Failed to upload media. Error:`,
      (error as any).response ? (error as any).response.data : (error as Error).message
    );
  }
}
