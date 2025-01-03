/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";
import 'dotenv/config';

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, API_TOKEN, BUSINESS_PHONE, API_VERSION, PORT } = process.env;

app.post("/webhook", async (req, res) => {
    // log incoming messages
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    // check if the webhook request contains a message
    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

    let data = {};

    if (message) {


        data = {
            messaging_product: "whatsapp",
            to: message.from,
            text: { body: "Echo: " + message.text.body },
            context: {
                message_id: message.id, // shows the message as a reply to the original user message
            },
        }

        await axios({
            method: "POST",
            url: `https://graph.facebook.com/${API_VERSION}/${BUSINESS_PHONE}/messages`,
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
            data: data,
        });
        // mark incoming message as read
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/${API_VERSION}/${BUSINESS_PHONE}/messages`,
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                status: "read",
                message_id: message.id,
            },
        });
    }

    res.sendStatus(200);
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // check the mode and token sent are correct
    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
        // respond with 200 OK and challenge token from the request
        res.status(200).send(challenge);
        console.log("Webhook verified successfully!");
    } else {
        // respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
    }
});

app.get("/", (req, res) => {
    res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});



// if (message.type === "interactive") {
//     data = {
//         messaging_product: "whatsapp",
//         to: message.from,
//         text: { body: "Has interactuado con un botón! :D" },
//         context: {
//             message_id: message.id, // shows the message as a reply to the original user message
//         },
//     }
// } else if (message.text.body === "button") {
//     data = {
//         messaging_product: "whatsapp",
//         to: message.from,
//         type: "interactive",
//         interactive: {
//             type: "button",
//             body: {
//                 text: "Here is a button example",
//             },
//             action: {
//                 buttons: [
//                     {
//                         type: "reply",
//                         reply: {
//                             id: "button1",
//                             title: "Button 1",
//                         },
//                     },
//                     {
//                         type: "reply",
//                         reply: {
//                             id: "button2",
//                             title: "Button 2",
//                         },
//                     },
//                 ],
//             },
//         },
//     }
// } else if (message.text.body === "image") {
//     data = {
//         messaging_product: "whatsapp",
//         to: message.from,
//         type: "image",
//         image: {
//             link: "https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg",
//         },
//     }
// } else {
//     data = {
//         messaging_product: "whatsapp",
//         to: message.from,
//         text: { body: "Echo: " + message.text.body },
//         context: {
//             message_id: message.id, // shows the message as a reply to the original user message
//         },
//     }
// }