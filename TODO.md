# TODO

- [x] Update message template for whatsapp bot
- [x] Move code to use typescript
- [x] Delete unused python and javascript code
- [x] Update logic for whatsapp bot
- [x] Implement logic to query and update database from response

## 🤖 amarento.bot

- [x] Handle error parsing names
- [x] Create class to handle user state
- [x] Handle people not coming to wedding ceremony
- [x] Handle people coming alone to wedding ceremony
- [x] Create question for each template. TEMPLATE IS USELESS!
  - [x] Convert initial message to interactive message with CTA
  - [x] Convert summary to interactive message
  - [x] Convert good bye message to text message
- [x] Goodbye message after "YES"
- [x] Update initial message template to require user action.
- [x] Add header to each message.
- [x] Handle database connection
  - [x] Read data from database
    - [x] Read all clients
    - [x] Read number of RSVP
  - [x] Write and save data to database
- [x] Reminder and QR Code
  - [x] Create endpoint to send reminder message.
  - [x] Create endpoint to send reminder with qr.
    - [x] Push image to whatsapp api
- [x] Stabilize webhook endpoint.
- [x] Fix endpoint to send reminder.
- [ ] Datetime format.
- [ ] Migrate to DENO or HONO.

## 💚 amarento.id

- [ ] Clients page
  - [ ] Create client table
  - [ ] Create client page to track progress

## NICE TO HAVE

- [ ] Create cli for functionalities e.g. excel to database, trigger initial message, send qr code
