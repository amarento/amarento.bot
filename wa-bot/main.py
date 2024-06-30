import requests
import json


STEFFEN_WA = "+4915901993904"
RANDY_WA = "+4917634685672"
RICKY_WA = "+4915256917547"
FELIX_WA = "+4915237363126"
VIO_WA = "+6281231080808"

url = 'https://graph.facebook.com/v19.0/370074172849087/messages'
headers = {
    'Content-Type': 'application/json',
    "Authorization": f"Bearer EAATo4FKSZAlkBO5DGSq3pWpKWIJsT8YS9EsB6AP473ZB8m24D8ZBzEwLZC54II3382EdJ5YE02A3WdN85KtoOfgyyOyUczagGZCS8mUfEjwlXEMeeyZC9qqahgVPqB8OyfRSrfZBINOFDq66QIHdHy3eWviwvi4sjdwP3ShzGDRngtVZAnKLQDlWCZCS8T3ZAWx9p2pwSg3o2fngiNa6ie",
}

payload = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": FELIX_WA,
    "type": "interactive",
    "interactive": {
        "type": "button",
        "header": {"type": "text", "text": "helloworld"},
        "body": {
            "text": "Hi Pablo! Your gardening workshop is scheduled for 9am tomorrow. Use the buttons if you need to reschedule. Thank you!"
        },
        "footer": {
            "text": "Lucky Shrub: Your gateway to succulents!™"
        },
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {
                        "id": "change-button",
                        "title": "Change"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "cancel-button",
                        "title": "Cancel"
                    }
                }
            ]
        }
    }
}


response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())
