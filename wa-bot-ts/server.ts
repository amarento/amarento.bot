import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { question2, question3, question4 } from "./utils/template";
import { indexToAlphabet, WhatsAppContact, WhatsAppMessage } from "./utils/utils";

dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT, SUPABASE_URL, SUPABASE_KEY } = process.env;

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

app.post("/webhook", async (req: Request, res: Response) => {
  const message: WhatsAppMessage | undefined =
    req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const contact: WhatsAppContact | undefined =
    req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

  /** question 2 */
  if (message?.type === "button") {
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
    const n_rsvp = 3;
    const buttons = Array.from({ length: n_rsvp }, (_, i) => ({
      type: "reply",
      reply: {
        id: `#reply-2${indexToAlphabet(i + 1)}`,
        title: (i + 1).toString(),
      },
    }));

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.from,
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: "Wedding Ricky & Glo",
          },
          body: {
            text: question2(3),
          },
          action: {
            buttons: buttons,
          },
        },
      },
    });

    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      },
    });
  }

  /** webhook questions */
  if (message?.type === "interactive") {
    const replyId = message.interactive!.button_reply.id;

    /** question 3 */
    if (replyId.includes("#reply-2")) {
      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
      const nConfirmGuest = parseInt(message.interactive!.button_reply.title);

      for (let i = 0; i < nConfirmGuest; i++) {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: message.from,
            text: {
              body: question3(i + 1),
            },
            context: {
              message_id: message.id,
            },
          },
        });

        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            status: "read",
            message_id: message.id,
          },
        });
      }
    }

    /** wedding ceremony - question 4 */
    if (replyId.includes("#reply-3")) {
      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

      const n_rsvp = 3;
      const buttons = Array.from({ length: n_rsvp }, (_, i) => ({
        type: "reply",
        reply: {
          id: `#reply-3${indexToAlphabet(i + 1)}`,
          title: (i + 1).toString(),
        },
      }));

      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: message.from,
          type: "interactive",
          interactive: {
            type: "button",
            header: {
              type: "text",
              text: "Wedding Ricky & Glo",
            },
            body: {
              text: question4(n_rsvp),
            },
            action: {
              buttons: buttons,
            },
          },
        },
      });

      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          status: "read",
          message_id: message.id,
        },
      });
    }

    /** summary and reset question */
    if (replyId.includes("#reply-4")) {
      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: message.from,
          text: {
            body: `Summary: `,
          },
          context: {
            message_id: message.id, // shows the message as a reply to the original user message
          },
        },
      });
    }
  }

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
  console.log(`Server is listening on port: ${PORT}`);
});
