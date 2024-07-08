/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { supabase } from "./supabase.js";
dotenv.config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

app.post("/webhook", async (req, res) => {
  // log incoming messages
  // console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  // check if the webhook request contains a message
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const contact = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

  // check if the incoming message contains text
  if (message?.type === "text") {
    // extract the business number to send the reply from it
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
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
            text: `Hi ${contact.profile.name}, \n\nBerapa undanganmu? Thank you!`,
          },
          footer: {
            text: "Datang ya",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "#reply-1A",
                  title: "1",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "#reply-1B",
                  title: "2",
                },
              },
            ],
          },
        },
      },
    });

    // mark incoming message as read
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

  if (message?.type === "interactive") {
    const replyId = message.interactive.button_reply.id;
    if (replyId.includes("#reply-1")) {
      const nGuest = message.interactive.button_reply.title;
      const replyMessage = nGuest === "1" ? "alone" : "with your spouse";

      // extract the business number to send the reply from it
      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

      // send reply message
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
            body: `Thank you for confirming. You are coming ${replyMessage}.`,
          },
          context: {
            message_id: message.id, // shows the message as a reply to the original user message
          },
        },
      });

      // send next question
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
            body: {
              text: "Pasti kah kamu datang? Thank you!",
            },
            footer: {
              text: "PLisss",
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "#reply-2a",
                    title: "Ya",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "#reply-2b",
                    title: "Tidak",
                  },
                },
              ],
            },
          },
        },
      });

      // mark incoming message as read
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

    if (replyId.includes("#reply-2")) {
      // extract the business number to send the reply from it
      const business_phone_number_id =
        req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

      // send reply message
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
            body: `Thank you for answering. Good byelalla!`,
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

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  console.log("webhook request incoming!");
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(mode, token, challenge);

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.status(200).send(`<pre>GA ONOK TOKEN WOE!</pre>`);
  }
});

app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("guests").select();
  console.log(data[0]);
  res.send(`<pre>AMARENTO IS THE BEST.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
