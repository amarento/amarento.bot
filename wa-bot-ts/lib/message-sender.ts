import axios from "axios";
import dotenv from "dotenv";
import FormData from "form-data";
import fs from "fs";
import qrcode from "qrcode";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import {
  BodyComponent,
  BodyParameter,
  DateTime,
  Header,
  HeaderComponent,
  HeaderParameter,
  Image,
  Language,
  Template,
} from "whatsapp-api-js/messages";
import { Tables } from "../database.types";
import { combineNames, logWithTimestamp, pathExist } from "./utils";
dotenv.config();

const { GRAPH_API_TOKEN, WEBHOOK_VERIFY_TOKEN } = process.env;
if (GRAPH_API_TOKEN === undefined) {
  console.error("GRAPH_API_TOKEN not defined.");
  process.exit(1);
}

/** business phone number id. */
const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";

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

export type TemplateComponentt = {
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
  components?: TemplateComponentt[]
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
      (error as any).response
        ? (error as any).response.data
        : (error as Error).message
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

export async function markAsRead(
  business_phone_number_id: string,
  messageId: string
) {
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

const Whatsapp = new WhatsAppAPI({
  token: GRAPH_API_TOKEN,
  appSecret: "TEST",
  webhookVerifyToken: WEBHOOK_VERIFY_TOKEN,
  secure: true,
});

export async function sendInitialMessageWithTemplate(
  name: string,
  waNumber: string,
  nRSVP: number
): Promise<void> {
  const component: TemplateComponentt[] = [
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
        { type: "text", text: name },
        { type: "text", text: "Ricky & Gloria" },
        { type: "text", text: "Mr. Papa & Mama" },
        { type: "text", text: "Mr. Papi & Mami" },
        { type: "text", text: "Nama Hari, 01/01/2024" },
        { type: "text", text: "Nama Gereja, Kota" },
        { type: "text", text: "00:00" },
        { type: "text", text: "Nama Tempat, Kota" },
        { type: "text", text: "00:00" },
        { type: "text", text: nRSVP.toString() },
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
  ];
  await sendTemplateMessage(
    BUSINESS_PHONE_NUMBER_ID,
    waNumber,
    "template_hello_1_test",
    component
  );
}

export async function sendReminderWithQRCodeTemplate(
  client: Tables<"amarento.id_clients">,
  guest: Tables<"amarento.id_guests">
) {
  /** create qr code */
  logWithTimestamp(`Creating QR code for guest with id ${guest.id}`);
  const url = `https://amarento.id/clients/${client.client_code}/${guest.id}`;
  const file = `./codes/qr-${client.client_code}-${guest.id}.png`;
  pathExist(file);

  await qrcode.toFile(file, url, {
    errorCorrectionLevel: "H",
    type: "png",
  });
  const id = await uploadMedia(BUSINESS_PHONE_NUMBER_ID, file);

  /** send message template. */
  const message = new Template(
    "amarento_reminder",
    new Language("id"),
    new HeaderComponent(new HeaderParameter(new Image(id, true))),
    new BodyComponent(
      new BodyParameter(guest.inv_names),
      new BodyParameter(`${client.name_groom} and ${client.name_bride}`),
      new BodyParameter(client.parents_name_groom ?? ""),
      new BodyParameter(client.parents_name_bride ?? ""),
      new BodyParameter(client.holmat_location ?? ""),
      new BodyParameter(new DateTime(client.holmat_time ?? "")),
      new BodyParameter(client.dinner_location ?? ""),
      new BodyParameter(new DateTime(client.dinner_time ?? "")),
      new BodyParameter(guest.n_rsvp_plan.toString()),
      new BodyParameter(
        combineNames(client.name_groom ?? "", client.name_bride ?? "")
      )
    )
  );

  /** send template message. */
  const response = await Whatsapp.sendMessage(
    BUSINESS_PHONE_NUMBER_ID,
    guest.wa_number,
    message
  );
  logWithTimestamp(
    `Reminder message sent with response. ${JSON.stringify(response)}`
  );
}
