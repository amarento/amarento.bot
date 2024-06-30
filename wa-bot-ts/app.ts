import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { WebhookEvent, WebhookMessage } from "./types";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ text: "hello world" });
});

app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("message coming");
  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("Webhook verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", (req: Request, res: Response) => {
  console.log("message coming");
  const body: WebhookEvent = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.changes[0].value;
      if (webhookEvent.messages && webhookEvent.messages.length > 0) {
        const message = webhookEvent.messages[0];
        handleMessage(message);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function handleMessage(message: WebhookMessage) {
  const senderId = message.from;
  const messageBody = message.text?.body;

  console.log(`Received message from ${senderId}: ${messageBody}`);

  // Here you can add your logic to process the message and send a response
  // For example, you could call a function to send a reply using the WhatsApp Business API
}

app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("Error: address already in use");
    } else {
      console.log(err);
    }
  });
