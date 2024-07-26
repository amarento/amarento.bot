import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { handleIncomingMessage } from "./utils/message-handler";

dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, PORT, SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

app.post("/webhook", async (req: Request, res: Response) => {
  const entry: WhatsappNotificationEntry | undefined = req.body.entry?.[0];
  const value: WhatsappNotificationValue | undefined = entry?.changes?.[0].value;

  // const business_phone_number_id = value?.metadata?.phone_number_id;

  const message = value?.messages?.[0];
  const status = value?.statuses?.at(0);

  /** ignore status sent and status read */
  if (
    status?.status === WhatsappNotificationStatusStatus.Sent ||
    status?.status === WhatsappNotificationStatusStatus.Read
  )
    return;

  await handleIncomingMessage(message, status);

  /** QUESTION1 - INITIAL MESSAGE (HELLO) */
  // if (
  //   status?.status === WhatsappNotificationStatusStatus.Delivered &&
  //   !numbers.includes(status.recipient_id)
  // ) {
  //   /** immediate return if the recipient already exists to exit the loop.
  //    * else add the recipient to the list.
  //    */
  //   numbers.push(status.recipient_id);
  //   const buttons: ButtonMessage[] = [
  //     {
  //       type: "reply",
  //       reply: {
  //         id: `#reply-holmat-1`,
  //         title: "YA",
  //       },
  //     },
  //     {
  //       type: "reply",
  //       reply: {
  //         id: `#reply-holmat-2`,
  //         title: "TIDAK",
  //       },
  //     },
  //   ];
  //   /** QUESTION 2  */
  //   await sendInteractiveMessage(
  //     business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //     status.recipient_id,
  //     "Apakah Anda akan menghadiri acara Pemberkatan / Holy Matrimony?",
  //     buttons
  //   );
  // }

  // /** HOLY MATRIMONY */
  // if (message && message.type === WhatsappNotificationMessageType.Interactive) {
  //   if (message.interactive === undefined) return;
  //   console.log(message.interactive);

  //   const replyId = message.interactive?.button_reply.id;
  //   if (replyId === undefined) return;
  //   /** NUMBER OF GUEST HOLY MATRIMONY */
  //   if (replyId?.includes("#reply-holmat")) {
  //     if (message.interactive?.button_reply.title.toLowerCase() === "tidak") {
  //       /** QUESTION 4 - Are you coming to wedding ceremony? */
  //       const buttons: ButtonMessage[] = [
  //         {
  //           type: "reply",
  //           reply: {
  //             id: `#reply-wedcer-1`,
  //             title: "YA",
  //           },
  //         },
  //         {
  //           type: "reply",
  //           reply: {
  //             id: `#reply-wedcer-2`,
  //             title: "TIDAK",
  //           },
  //         },
  //       ];
  //       await sendInteractiveMessage(
  //         business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //         message.from,
  //         "Apakah Anda akan menghadiri acara Resepsi / Wedding Ceremony?",
  //         buttons
  //       );
  //       await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //       return;
  //     }

  //     /** QUESTION 3 - How many people would come to holy matrimony? */
  //     const n_rsvp = 3;
  //     const buttons: ButtonMessage[] = Array.from({ length: n_rsvp }, (_, i) => ({
  //       type: "reply",
  //       reply: {
  //         id: `#reply-guest-holmat-${indexToAlphabet(i + 1)}`,
  //         title: (i + 1).toString(),
  //       },
  //     }));
  //     await sendInteractiveMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       numberOfGuestQuestion(n_rsvp, "Holy Matrimony"),
  //       buttons
  //     );
  //     await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //     return;
  //   }

  //   /** QUESTION 4 - Are you coming to wedding ceremony? */
  //   if (replyId.includes("#reply-guest-holmat")) {
  //     const buttons: ButtonMessage[] = [
  //       {
  //         type: "reply",
  //         reply: {
  //           id: `#reply-wedcer-1`,
  //           title: "YA",
  //         },
  //       },
  //       {
  //         type: "reply",
  //         reply: {
  //           id: `#reply-wedcer-2`,
  //           title: "TIDAK",
  //         },
  //       },
  //     ];
  //     await sendInteractiveMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       "Apakah Anda akan menghadiri acara Resepsi / Wedding Ceremony?",
  //       buttons
  //     );
  //     await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //     return;
  //   }

  //   /** QUESTION 5 - NUMBER OF GUESTS WEDDING CEREMONY */
  //   if (replyId.includes("#reply-wedcer")) {
  //     const nConfirmGuest = parseInt(message.interactive.button_reply.title);
  //     /** SUMMARY AND REDO */
  //     if (nConfirmGuest === 1) {
  //       const components: TemplateComponent[] = [
  //         {
  //           type: "body",
  //           parameters: [
  //             {
  //               type: "text",
  //               text: "YA",
  //             },
  //             {
  //               type: "text",
  //               text: "2",
  //             },
  //             {
  //               type: "text",
  //               text: "YA",
  //             },
  //             {
  //               type: "text",
  //               text: "2",
  //             },
  //             {
  //               type: "text",
  //               text: "Nama 1, Nama 2",
  //             },
  //           ],
  //         },
  //       ];

  //       await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //       await sendTemplateMessage(
  //         business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //         message.from,
  //         "amarento_question_summary_and_redo",
  //         components
  //       );
  //       await sendTemplateMessage(
  //         business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //         message.from,
  //         "amarento_goodbye"
  //       );
  //       return;
  //     }

  //     const n_rsvp = 3;
  //     const buttons: ButtonMessage[] = Array.from({ length: n_rsvp }, (_, i) => ({
  //       type: "reply",
  //       reply: {
  //         id: `#reply-guest-wedcer-${indexToAlphabet(i + 1)}`,
  //         title: (i + 1).toString(),
  //       },
  //     }));
  //     await sendInteractiveMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       numberOfGuestQuestion(n_rsvp, "Wedding Cerremony"),
  //       buttons
  //     );
  //     await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //     return;
  //   }

  //   /** QUESTION 6 - NAME OF THE ATTENDEES */
  //   if (replyId.includes("#reply-guest-wedcer")) {
  //     const nConfirmGuest = parseInt(message.interactive.button_reply.title);
  //     await sendTextMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       attendanceNamesQuestion(nConfirmGuest),
  //       message.id
  //     );
  //     await markAsRead(business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID, message.id);
  //     return;
  //   }
  // }

  // /** SUMMARY AND REDO */
  // if (message && message.type === WhatsappNotificationMessageType.Text) {
  //   const n_rsvp = 2;
  //   const body = message.text?.body;
  //   if (body === undefined) {
  //     /** REPEAT QUESTION: Please write the name of the attendees  */
  //     await sendTextMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       attendanceNamesQuestion(n_rsvp),
  //       message.id
  //     );

  //     return;
  //   }

  //   const names = parseNamesFromInput(body, n_rsvp);
  //   if (names.error.isError && names.error.message) {
  //     await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
  //     await sendTextMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       names.error.message,
  //       message.id
  //     );
  //     /** REPEAT QUESTION: Please write the name of the attendees  */
  //     await sendTextMessage(
  //       business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //       message.from,
  //       attendanceNamesQuestion(2)
  //     );
  //     return;
  //   }

  //   /** write names to database */
  //   const components: TemplateComponent[] = [
  //     {
  //       type: "body",
  //       parameters: [
  //         {
  //           type: "text",
  //           text: "YA",
  //         },
  //         {
  //           type: "text",
  //           text: "2",
  //         },
  //         {
  //           type: "text",
  //           text: "YA",
  //         },
  //         {
  //           type: "text",
  //           text: "2",
  //         },
  //         {
  //           type: "text",
  //           text: "Nama 1, Nama 2",
  //         },
  //       ],
  //     },
  //   ];
  //   await sendTemplateMessage(
  //     business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //     message.from,
  //     "amarento_question_summary_and_redo",
  //     components
  //   );

  //   console.log("Template sent!");

  //   const goodbye_components: TemplateComponent[] = [
  //     {
  //       type: "body",
  //       parameters: [
  //         {
  //           type: "text",
  //           text: "Ricky",
  //         },
  //         {
  //           type: "text",
  //           text: "Glo",
  //         },
  //       ],
  //     },
  //   ];
  //   await sendTemplateMessage(
  //     business_phone_number_id ?? BUSINESS_PHONE_NUMBER_ID,
  //     message.from,
  //     "amarento_goodbye",
  //     goodbye_components
  //   );

  //   console.log("Goodbye sent!");
  // }

  res.sendStatus(200);
});

app.get("/webhook", (req: Request, res: Response) => {
  console.log("webhook request incoming!");
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(mode, token, challenge);

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.status(200).send("GA ONOK TOKEN WOE!");
  }
});

app.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("guests").select();
  console.log(data?.[0]);
  res.send("AMARENTO IS THE BEST.");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: http://localhost:${PORT}`);
});
