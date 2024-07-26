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

  const message = value?.messages?.[0];
  const status = value?.statuses?.at(0);

  /** ignore status sent and status read */
  if (
    status?.status === WhatsappNotificationStatusStatus.Sent ||
    status?.status === WhatsappNotificationStatusStatus.Read
  )
    return;

  await handleIncomingMessage(message, status);

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
