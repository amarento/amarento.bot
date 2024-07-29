import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import UserMessage from "./model/UserMessage";
import UserMessageStore from "./model/UserMessageStore";
import { supabase } from "./supabase";
import { mapToArray } from "./utils/functions";
import { sendInitialMessageWithTemplate } from "./utils/initial-message";
import { handleIncomingMessage } from "./utils/message-handler";

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
const { WEBHOOK_VERIFY_TOKEN, PORT, SUPABASE_URL, SUPABASE_KEY } = process.env;

app.post("/webhook", async (req: Request, res: Response) => {
  const entry: WhatsappNotificationEntry | undefined = req.body.entry?.[0];
  const value: WhatsappNotificationValue | undefined = entry?.changes?.[0].value;

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

app.post("/api/send-initial-message", async (req: Request, res: Response) => {
  const { data: clients, error } = await supabase.from("guests").select();
  if (error) return res.status(500).send({ success: false, message: error });
  clients?.map(
    async (client) =>
      await sendInitialMessageWithTemplate(client.inv_names, client.wa_number, client.n_rsvp_plan)
  );
  res.status(200).send({ success: true, message: null });
});

app.post("/api/reset-user-state", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/api/user-state", (req: Request, res: Response) => {
  const states = UserMessageStore.getData();
  const response = mapToArray<string, UserMessage>(states);
  res.status(200).send(response);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: http://localhost:${PORT}`);
});
