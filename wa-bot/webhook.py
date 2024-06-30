from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0/370074172849087/messages'
ACCESS_TOKEN = "EAATo4FKSZAlkBO5DGSq3pWpKWIJsT8YS9EsB6AP473ZB8m24D8ZBzEwLZC54II3382EdJ5YE02A3WdN85KtoOfgyyOyUczagGZCS8mUfEjwlXEMeeyZC9qqahgVPqB8OyfRSrfZBINOFDq66QIHdHy3eWviwvi4sjdwP3ShzGDRngtVZAnKLQDlWCZCS8T3ZAWx9p2pwSg3o2fngiNa6ie"

conversation_state = {}


def send_message(recipient_id, message_type, message):
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "messaging_product": "whatsapp",
        "to": recipient_id,
        "type": message_type,
        "text": {
            "body": message
        } if message_type == "text" else message
    }
    response = requests.post(WHATSAPP_API_URL, headers=headers, json=data)
    return response.json()


def send_interactive_message(recipient_id, header, body, buttons):
    message = {
        "type": "interactive",
        "interactive": {
            "type": "button",
            "header": {
                "type": "text",
                "text": header
            },
            "body": {
                "text": body
            },
            "action": {
                "buttons": buttons
            }
        }
    }
    send_message(recipient_id, "interactive", message)


@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.json
    message = data.get('messages')[0]
    mode = message["hub.mode"]
    token = message["hub.verify_token"]

    # check the mode and token sent are correct
    if (mode == "subscribe" and token == "AMARENTO"):
        challenge = message["hub.challenge"]
        # respond with 200 OK and challenge token from the request
        print("Webhook verified successfully!")
        return jsonify(challenge), 200
    else:
        # respond with '403 Forbidden' if verify tokens do not match
        return jsonify(challenge), 403

    # sender_id = message['from']
    # message_text = message['text']['body']
    #  print(message)

    #   user_state = conversation_state.get(sender_id, {"question": 1})

    #    if user_state["question"] == 1:
    #         header = "Answer 1"
    #         body = "Choose an option:"
    #         buttons = [
    #             {
    #                 "type": "reply",
    #                 "reply": {
    #                     "id": "option_1",
    #                     "title": "Option 1"
    #                 }
    #             },
    #             {
    #                 "type": "reply",
    #                 "reply": {
    #                     "id": "option_2",
    #                     "title": "Option 2"
    #                 }
    #             }
    #         ]
    #         send_interactive_message(sender_id, header, body, buttons)
    #         user_state["question"] = "answered_1"

    #     elif user_state["question"] == "answered_1":
    #         if message_text == "Option 1":
    #             header = "Question 2"
    #             body = "Please provide more details."
    #             send_message(sender_id, "text", body)
    #             user_state["question"] = 2
    #         elif message_text == "Option 2":
    #             header = "Question 3"
    #             body = "Thank you for your response."
    #             send_message(sender_id, "text", body)
    #             user_state["question"] = 3
    #         else:
    #             body = "Sorry, I didn't understand that. Please reply with 1 or 2."
    #             send_message(sender_id, "text", body)
    #             user_state["question"] = "answered_1"

    #     elif user_state["question"] == 2:
    #         header = "Question 4"
    #         body = "Can you clarify your previous answer?"
    #         send_message(sender_id, "text", body)
    #         user_state["question"] = 4

    #     elif user_state["question"] == 4:
    #         header = "Question 5"
    #         body = "Thank you for your clarification. Is there anything else you want to add?"
    #         send_message(sender_id, "text", body)
    #         user_state["question"] = 5

    #     elif user_state["question"] == 5:
    #         body = "Thank you for your responses. Our team will review your inputs."
    #         send_message(sender_id, "text", body)

    #     conversation_state[sender_id] = user_state

    #     return jsonify({"status": "success"}), 200


if __name__ == "__main__":
    app.run(port=5000)
