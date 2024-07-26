import dotenv from "dotenv";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import { ActionCTA, Body, Footer, Header, Interactive } from "whatsapp-api-js/messages";
import { initialMessage } from "./message";
import { sendInteractiveCTAMessage } from "./message-sender";
dotenv.config({ path: "./../.env" });

const { GRAPH_API_TOKEN, WEBHOOK_VERIFY_TOKEN } = process.env;

/** list of phone numbers. */
const girlies = ["6281231080808", "62895324913833"];
const boys: string[] = ["4915237363126", "4915901993904", "4917634685672", "4915256917547"];
const testers: string[] = ["4915237363126", "6289612424707"];

/** business phone number id. */
const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";

if (GRAPH_API_TOKEN === undefined) {
  console.error("GRAPH_API_TOKEN not defined.");
  process.exit(1);
}

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

testers.map(async (number) => await sendInitialMessage(number));
// numbers.map(async (number) => await sendInitialMessageWithLib(number));
// numbers.map(async (number) => {
//   const buttons: ButtonMessage[] = [
//     {
//       type: "reply",
//       reply: {
//         id: `#reply-reset-1`,
//         title: "YA",
//       },
//     },
//     {
//       type: "reply",
//       reply: {
//         id: `#reply-reset-2`,
//         title: "TIDAK",
//       },
//     },
//   ];
//   await sendInteractiveMessage(
//     BUSINESS_PHONE_NUMBER_ID,
//     number,
//     summaryMessage(false, 0, false, 0, ""),
//     buttons
//   );
// });
