import dotenv from "dotenv";
import { sendTemplateMessage, TemplateComponent } from "./message-sender";
dotenv.config({ path: "./../.env" });

const girlies = ["6281231080808", "62895324913833"];
const boys: string[] = ["4915237363126", "4915901993904", "4917634685672", "4915256917547"];
const numbers: string[] = ["4915237363126"];
const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";

async function sendInitialMessage(number: string): Promise<void> {
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
  ];

  await sendTemplateMessage(BUSINESS_PHONE_NUMBER_ID, number, "template_hello_1_test", component);
}

// Example usage:
numbers.map(async (number) => await sendInitialMessage(number));
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
