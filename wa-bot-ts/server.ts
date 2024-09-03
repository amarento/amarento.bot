import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { ZodError } from "zod";
import { handleIncomingMessage } from "./lib/message-handler";
import {
  sendInitialMessageWithTemplate,
  sendReminderWithQRCodeTemplate,
} from "./lib/message-sender";
import { logWithTimestamp, mapToArray } from "./lib/utils";
import { SendReminderWithQRSchema } from "./model/schema";
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
const { WEBHOOK_VERIFY_TOKEN, PORT } = process.env;

app.post("/webhook", async (req: Request, res: Response) => {
  const entry: WhatsappNotificationEntry | undefined = req.body.entry?.[0];
  const value: WhatsappNotificationValue | undefined =
    entry?.changes?.[0].value;

  const message = value?.messages?.[0];
  const status = value?.statuses?.at(0);

  /** ignore status sent and status read */
  if (
    status?.status === WhatsappNotificationStatusStatus.Sent ||
    status?.status === WhatsappNotificationStatusStatus.Read ||
    status?.status === WhatsappNotificationStatusStatus.Delivered
  )
    return;

  await handleIncomingMessage(message);

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
  res.send("AMARENTO IS THE BEST.");
});

app.get("/api/user-state", (req: Request, res: Response) => {
  const states = UserMessageStore.getData();
  const response = mapToArray<string, UserMessage>(states);
  res.status(200).send(response);
});

app.post("/api/reset-user-state", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.post("/api/send-initial-message", async (req: Request, res: Response) => {
  const { data: clients, error } = await supabase
    .from("amarento.id_guests")
    .select();
  if (error) return res.status(500).send({ success: false, message: error });

  /** send initial messsage. */
  clients?.map(
    async (client) =>
      await sendInitialMessageWithTemplate(
        client.inv_names,
        client.wa_number,
        client.n_rsvp_plan
      )
  );
  res.status(200).send({ success: true, message: null });
});

app.post("/api/send-reminder", async (req: Request, res: Response) => {
  const { data: client, error } = await supabase
    .from("amarento.id_clients")
    .select(`*, "amarento.id_guests" (*)`)
    .eq("client_code", "RJGFWB8V")
    .single();
  if (error) return res.status(500).send({ success: false, message: error });

  /** send reminder. */
  client?.["amarento.id_guests"].map(
    async (guest) => await sendReminderWithQRCodeTemplate(client, guest)
  );

  /** send response. */
  res.status(200).send({ success: true, message: null });
});

app.post("/api/send-reminder-with-qr", async (req: Request, res: Response) => {
  try {
    const request = SendReminderWithQRSchema.parse(req.body);
    const { data: client, error } = await supabase
      .from("amarento.id_clients")
      .select(`*, "amarento.id_guests" (*)`)
      .eq("client_code", request.code)
      .single();
    if (error) return res.status(500).send({ success: false, message: error });

    /** send reminder. */
    logWithTimestamp(
      `Sending reminder to ${client["amarento.id_guests"].length} guests.`
    );
    // client?.["amarento.id_guests"].map(
    //   async (guest) => await sendReminderWithQRCodeTemplate(client, guest)
    // );
    logWithTimestamp("Reminder sent successfully.");

    const test = client?.["amarento.id_guests"].filter((x) =>
      x.wa_number.includes("4915237363126")
    );
    await sendReminderWithQRCodeTemplate(client, test.at(0)!);

    /** send response. */
    res.status(200).send({ success: true, message: null });
  } catch (error) {
    if (error instanceof ZodError)
      res.status(400).json({ success: false, errors: error.errors });
    else
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: http://localhost:${PORT}`);
});
