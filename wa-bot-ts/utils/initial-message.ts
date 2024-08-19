import dotenv from "dotenv";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import { ActionCTA, Body, Footer, Header, Interactive, Text } from "whatsapp-api-js/messages";
import { Tables } from "../database.types";
import { sendInteractiveCTAMessage, sendTemplateMessage, TemplateComponent } from "./message-sender";
import { initialMessage, reminderMessage } from "./message-template";
dotenv.config({ path: "./../.env" });

const { GRAPH_API_TOKEN, WEBHOOK_VERIFY_TOKEN } = process.env;
if (GRAPH_API_TOKEN === undefined) {
  console.error("GRAPH_API_TOKEN not defined.");
  process.exit(1);
}

/** business phone number id. */
const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";

const Whatsapp = new WhatsAppAPI({
  token: GRAPH_API_TOKEN,
  appSecret: "TEST",
  webhookVerifyToken: WEBHOOK_VERIFY_TOKEN,
  secure: true,
});

async function sendInitialMessageWithLib(number: string): Promise<void> {
  const interactive_catalog_message = new Interactive(
    new ActionCTA("Wedding Website", "https://www.amarento.id/"),
    new Body(
      initialMessage(
        "Aaron Randy",
        "Ricky & Gloria",
        "Mr. Papa & Mama",
        "Mr. Papi & Mami",
        "Nama Hari, 01/01/2024",
        "Nama Gereja, Kota",
        "00:00",
        "Nama Tempat, Kota",
        "00:00",
        3
      )
    ),
    new Header("The wedding of Ricky & Gloria"),
    new Footer("Pesan ini terkirim secara otomatis oleh Amarento.")
  );
  await Whatsapp.sendMessage(BUSINESS_PHONE_NUMBER_ID, number, interactive_catalog_message);
}

async function sendInitialMessage(number: string) {
  await sendInteractiveCTAMessage(
    BUSINESS_PHONE_NUMBER_ID,
    number,
    initialMessage(
      "Aaron Randy",
      "Ricky & Gloria",
      "Mr. Papa & Mama",
      "Mr. Papi & Mami",
      "Nama Hari, 01/01/2024",
      "Nama Gereja, Kota",
      "00:00",
      "Nama Tempat, Kota",
      "00:00",
      3
    ),
    { display_text: "Wedding Website", url: "https://www.amarento.id/" }
  );
}

export async function sendInitialMessageWithTemplate(name: string, waNumber: string, nRSVP: number): Promise<void> {
  const component: TemplateComponent[] = [
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
  await sendTemplateMessage(BUSINESS_PHONE_NUMBER_ID, waNumber, "template_hello_1_test", component);
}

export async function sendReminderMessage(client: Tables<"amarento.id_clients">, guest: Tables<"amarento.id_guests">) {
  const message = new Text(
    reminderMessage(
      guest.inv_names,
      `${client.name_bride} and ${client.name_groom}`,
      client.parents_name_bride ?? "",
      client.parents_name_groom ?? "",
      client.wedding_day ?? "",
      client.holmat_location ?? "",
      client.holmat_time ?? "",
      client.dinner_location ?? "",
      client.dinner_time ?? "",
      guest.n_rsvp_plan
    )
  );

  await Whatsapp.sendMessage(BUSINESS_PHONE_NUMBER_ID, guest.wa_number, message);
}
