import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import { ServerMessage } from "whatsapp-api-js/types";
import { ZodError } from "zod";

import { Amarento } from "./lib/amarento";
import { logWithTimestamp, mapToArray } from "./lib/utils";
import {
  SendMessageRequestSchema,
  SendReminderRequestSchema,
} from "./model/schema";
import UserMessage from "./model/UserMessage";
import UserMessageStore from "./model/UserMessageStore";
import { supabase } from "./supabase";

const app = express();
app.use(express.json());

const options: CorsOptions = {
  origin: "http://localhost:3001", // Replace with your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204,
};
app.use(cors(options));

dotenv.config();
const {
  WEBHOOK_VERIFY_TOKEN,
  PORT,
  BUSINESS_PHONE_NUMBER_ID,
  GRAPH_API_TOKEN,
} = process.env;

if (BUSINESS_PHONE_NUMBER_ID === undefined) {
  console.error("BUSINESS_PHONE_NUMBER_ID not defined.");
  process.exit(1);
}

if (GRAPH_API_TOKEN === undefined) {
  console.error("GRAPH_API_TOKEN not defined.");
  process.exit(1);
}

app.get("/", async (req: Request, res: Response) => {
  res.send("AMARENTO IS THE BEST.");
});

const api = new WhatsAppAPI({
  token: GRAPH_API_TOKEN,
  appSecret: "TEST",
  webhookVerifyToken: WEBHOOK_VERIFY_TOKEN,
  secure: true,
  v: "v20.0",
});

const amarento = new Amarento(BUSINESS_PHONE_NUMBER_ID, api);
app.post("/webhook", async (req: Request, res: Response) => {
  const entry: WhatsappNotificationEntry | undefined = req.body.entry?.[0];
  const value: WhatsappNotificationValue | undefined =
    entry?.changes?.[0].value;

  /** ignore status sent and status read */
  const status = value?.statuses?.at(0);
  if (
    status?.status === WhatsappNotificationStatusStatus.Sent ||
    status?.status === WhatsappNotificationStatusStatus.Read ||
    status?.status === WhatsappNotificationStatusStatus.Delivered
  )
    return;

  const message = value?.messages?.[0] as ServerMessage;
  await amarento.onMessage(message);

  res.sendStatus(200);
});

app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.status(200).send("GA ONOK TOKEN WOE!");
  }
});

app.get("/api/user-state", (_: Request, res: Response) => {
  const states = UserMessageStore.getData();
  const response = mapToArray<string, UserMessage>(states);
  res.status(200).send({ success: true, data: response });
});

app.post("/api/reset-user-state", (_: Request, res: Response) => {
  UserMessageStore.clear();
  res.status(200).send({
    success: true,
    message: "WA RSVP from all guests was cleared out successfully.",
  });
});

app.post("/api/send-initial-message", async (req: Request, res: Response) => {
  try {
    /** client code. */
    const request = SendMessageRequestSchema.parse(req.body);

    const { data: client, error } = await supabase
      .from("amarento.id_clients")
      .select(`*, "amarento.id_guests" (*)`)
      .eq("client_code", request.code)
      .single();
    if (error) return res.status(500).send({ success: false, message: error });

    /** send initial messsage. */
    client?.["amarento.id_guests"].map(
      async (guest) => await amarento.sendInitialMessage(client, guest)
    );
    logWithTimestamp("Initial message sent successfully.");

    res.status(200).send({ success: true, message: null });
  } catch (error) {
    if (error instanceof ZodError)
      res.status(400).json({ success: false, errors: error.errors });
    else
      res.status(500).json({
        success: false,
        message: "Error occurs when sending initial message.",
      });
  }
});

app.post("/api/send-reminder", async (req: Request, res: Response) => {
  try {
    const request = SendReminderRequestSchema.parse(req.body);
    const { data: client, error } = await supabase
      .from("amarento.id_clients")
      .select(`*, "amarento.id_guests" (*)`)
      .eq("client_code", request.code)
      .single();
    if (error) return res.status(500).send({ success: false, message: error });

    /** filter guests and send reminder. */
    const guests = client["amarento.id_guests"].filter(
      (guest) => guest.rsvp_dinner && guest.rsvp_holmat
    );
    logWithTimestamp(`Sending reminder to ${guests.length} guests.`);
    guests.map(
      async (guest) =>
        await amarento.sendReminder(client, guest, request.sendQR)
    );
    logWithTimestamp("Reminder sent successfully.");

    /** send response. */
    res.status(200).send({ success: true, message: null });
  } catch (error) {
    if (error instanceof ZodError)
      res.status(400).json({ success: false, errors: error.errors });
    else
      res.status(500).json({
        success: false,
        message: "Error occurs when sending reminder with QR.",
      });
  }
});

app.post("/api/send-reminder", async (req: Request, res: Response) => {
  try {
    const request = SendMessageRequestSchema.parse(req.body);
    const { data: client, error } = await supabase
      .from("amarento.id_clients")
      .select(`*, "amarento.id_guests" (*)`)
      .eq("client_code", request.code)
      .single();
    if (error) return res.status(500).send({ success: false, message: error });

    /** send reminder. */
    client?.["amarento.id_guests"].map(
      async (guest) => await amarento.sendReminder(client, guest)
    );

    /** send response. */
    res.status(200).send({ success: true, message: null });
  } catch (error) {
    if (error instanceof ZodError)
      res.status(400).json({ success: false, errors: error.errors });
    else
      res.status(500).json({
        success: false,
        message: "Error occurs when sending reminder.",
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: http://localhost:${PORT}`);
});
