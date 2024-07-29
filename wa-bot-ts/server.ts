import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import { createClient } from "@supabase/supabase-js";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import UserMessageStore from "./model/UserMessageStore";
import { sendInitialMessageWithTemplate } from "./utils/initial-message";
import { handleIncomingMessage } from "./utils/message-handler";

dotenv.config();

const app = express();
app.use(express.json());

const options: CorsOptions = {
  origin: "http://localhost:3001", // Replace with your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204,
};
app.use(cors(options));

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
  const { data, error } = await supabase.from("guests").select();
  res.send("AMARENTO IS THE BEST.");
});

app.post("/api/send-initial-message", (req: Request, res: Response) => {
  const testers: string[] = [
    "4915237363126",
    "4915901993904",
    "4917634685672",
    "4915256917547",
    "6281231080808",
  ];
  testers.map(async (number) => await sendInitialMessageWithTemplate(number));
  res.status(200).send("OK");
});

app.post("/api/reset-user-state", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.get("/api/user-state", (req: Request, res: Response) => {
  res.status(200).send(JSON.stringify(Object.fromEntries(UserMessageStore.getData())));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: http://localhost:${PORT}`);
});
