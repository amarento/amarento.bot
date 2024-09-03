import FormData from "form-data";
import fs from "fs";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import {
  ActionButtons,
  Body,
  BodyComponent,
  BodyParameter,
  Button,
  DateTime,
  Header,
  HeaderComponent,
  HeaderParameter,
  Image,
  Interactive,
  Language,
  Template,
  Text,
  URLComponent,
} from "whatsapp-api-js/messages";
import { ServerMedia, ServerMessage } from "whatsapp-api-js/types";
import { Tables } from "../database.types";
import UserMessage from "../model/UserMessage";
import UserMessageStore from "../model/UserMessageStore";
import { supabase } from "../supabase";
import { ButtonMessage, sendInteractiveButtonMessage } from "./message-sender";
import { MessageTemplate } from "./message-template";
import {
  combineNames,
  generateInvitation,
  getRSVPNumber,
  indexToAlphabet,
  logWithTimestamp,
  parseNamesFromInput,
  pathExist,
} from "./utils";

const READY_MESSAGE = "ok";

export class Amarento {
  private whatsappId: string;
  private api: WhatsAppAPI;

  constructor(business_phone_number_id: string, api: WhatsAppAPI) {
    this.whatsappId = business_phone_number_id;
    this.api = api;
  }

  public onMessage = async (message?: ServerMessage) => {
    if (message?.from === undefined) return;

    if (message && UserMessageStore.get(message.from) === undefined)
      UserMessageStore.set(message.from, new UserMessage());

    const state = UserMessageStore.get(message!.from);
    if (state === undefined) {
      console.error("State is empty.");
      return;
    }

    if (
      message?.type === "button" &&
      message.button?.text.toLowerCase() === READY_MESSAGE &&
      state.getNextQuestionId() === 0
    ) {
      /** QUESTION 1 */
      const _message = new Interactive(
        new ActionButtons(
          new Button("#reply-holmat-1", "YA"),
          new Button("#reply-holmat-2", "TIDAK")
        ),
        new Body(
          "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?"
        )
      );

      await this.api.sendMessage(this.whatsappId, message.from, _message);
      state.setNextQuestionId(1);
    }

    if (message === undefined) return;
    switch (state.getNextQuestionId()) {
      case 1: {
        if (message.type !== "interactive") return;

        const replyId = message.interactive.button_reply.id;
        if (replyId === undefined) return;

        /** QUESTION 3 - Are you coming to the wedding ceremony? */
        if (message.interactive?.button_reply.title.toLowerCase() === "tidak") {
          state.setIsAttendHolmat(false);

          const _message = new Interactive(
            new ActionButtons(
              new Button("#reply-wedcer-1", "YA"),
              new Button("#reply-wedcer-2", "TIDAK")
            ),
            new Body(
              "Apakah Anda akan menghadiri acara *Resepsi / Wedding Ceremony*?"
            )
          );
          await this.api.sendMessage(this.whatsappId, message.from, _message);
          await this.api.markAsRead(this.whatsappId, message.id);

          state.setNextQuestionId(3);
          return;
        }

        /** QUESTION 2 - How many people would come to holy matrimony? */
        state.setIsAttendHolmat(true);

        const nRSVP = await getRSVPNumber(message.from);
        const buttons: ButtonMessage[] = Array.from(
          { length: nRSVP },
          (_, i) =>
            new Button(
              `#reply-guest-holmat-${indexToAlphabet(i + 1)}`,
              (i + 1).toString()
            )
        );

        await sendInteractiveButtonMessage(
          this.whatsappId,
          message.from,
          MessageTemplate.numberOfGuest(nRSVP, "Holy Matrimony"),
          buttons
        );

        await this.api.markAsRead(this.whatsappId, message.id);

        state.setNextQuestionId(2);
        break;
      }
      case 2: {
        if (message.type !== "interactive") return;

        const nConfirmGuest = parseInt(message.interactive.button_reply.title);
        state.setNRsvpHolmat(nConfirmGuest);

        /** send confirmation message. */
        const confirmation = new Text(
          `Thank you for confirming! ${nConfirmGuest} orang akan datang di acara *Pemberkatan / Holy Matrimony*.`
        );
        await this.api.sendMessage(this.whatsappId, message.from, confirmation);

        /** send interactive message. */
        const interactive = new Interactive(
          new ActionButtons(
            new Button("#reply-wedcer-1", "YA"),
            new Button("#reply-wedcer-2", "TIDAK")
          ),
          new Body(
            "Apakah Anda akan menghadiri acara *Resepsi / Wedding Ceremony*?"
          )
        );
        await this.api.sendMessage(this.whatsappId, message.from, interactive);
        await this.api.markAsRead(this.whatsappId, message.id);

        state.setNextQuestionId(3);
        return;
      }
      case 3: {
        /** SUMMARY AND REDO */
        if (message.type !== "interactive") return;

        if (message.interactive?.button_reply.title.toLowerCase() === "tidak") {
          state.setIsAttendDinner(false);

          /** send reset message. */
          const reset = new Interactive(
            new ActionButtons(
              new Button("#reply-reset-1", "YA"),
              new Button("#reply-reset-2", "TIDAK")
            ),
            new Body(
              MessageTemplate.summary(
                state.getIsAttendHolmat(),
                state.getNRsvpHolmat(),
                state.getIsAttendDinner(),
                state.getNRsvpDinner(),
                state.getDinnerNames().join(", ")
              )
            )
          );
          await this.api.sendMessage(this.whatsappId, message.from, reset);

          state.setNextQuestionId(6);
          return;
        }

        state.setIsAttendDinner(true);

        const nRSVP = await getRSVPNumber(message.from);
        const buttons: ButtonMessage[] = Array.from(
          { length: nRSVP },
          (_, i) => ({
            type: "reply",
            reply: {
              id: `#reply-guest-wedcer-${indexToAlphabet(i + 1)}`,
              title: (i + 1).toString(),
            },
          })
        );
        await sendInteractiveButtonMessage(
          this.whatsappId,
          message.from,
          MessageTemplate.numberOfGuest(nRSVP, "Wedding Cerremony"),
          buttons
        );
        await this.api.markAsRead(this.whatsappId, message.id);

        state.setNextQuestionId(4);
        break;
      }
      case 4: {
        if (message.type !== "interactive") return;

        const nConfirmGuest = parseInt(message.interactive.button_reply.title);
        state.setNRsvpDinner(nConfirmGuest);

        /** send attendance message. */
        const attendance = new Text(
          MessageTemplate.attendanceNames(nConfirmGuest)
        );
        await this.api.sendMessage(this.whatsappId, message.from, attendance);
        await this.api.markAsRead(this.whatsappId, message.id);

        state.setNextQuestionId(5);
        return;
      }
      case 5: {
        if (message && message.type === "text") {
          const nRSVP = await getRSVPNumber(message.from);
          const body = message.text?.body;
          if (body === undefined) {
            /** REPEAT QUESTION: Please write the name of the attendees  */
            const attend = new Text(MessageTemplate.attendanceNames(nRSVP));
            await this.api.sendMessage(this.whatsappId, message.from, attend);
            return;
          }

          const names = parseNamesFromInput(body, state.getNRsvpDinner());
          if (names.error.isError && names.error.message) {
            await this.api.markAsRead(this.whatsappId, message.id);

            /** send error message. */
            const error = new Text(names.error.message);
            await this.api.sendMessage(this.whatsappId, message.from, error);

            /** REPEAT QUESTION: Please write the name of the attendees  */
            const attend = new Text(MessageTemplate.attendanceNames(nRSVP));
            await this.api.sendMessage(this.whatsappId, message.from, attend);
            return;
          }
          state.setDinnerNames(names.names);

          /** send reset message. */
          const reset = new Interactive(
            new ActionButtons(
              new Button("#reply-reset-1", "YA"),
              new Button("#reply-reset-2", "TIDAK")
            ),
            new Body(
              MessageTemplate.summary(
                state.getIsAttendHolmat(),
                state.getNRsvpHolmat(),
                state.getIsAttendDinner(),
                state.getNRsvpDinner(),
                state.getDinnerNames().join(", ")
              )
            ),
            new Header("The wedding of Ricky & Gloria")
          );

          await this.api.sendMessage(this.whatsappId, message.from, reset);

          state.setNextQuestionId(6);
        }
      }
      case 6: {
        if (message.type !== "interactive") return;

        const response = message.interactive?.button_reply.title.toLowerCase();
        if (response === "ya") {
          const goodbye = new Text(MessageTemplate.goodbye);
          await this.api.sendMessage(this.whatsappId, message.from, goodbye);

          state.setNextQuestionId(7);

          /** write response to database */
          const { error } = await supabase
            .from("amarento.id_guests")
            .update({
              rsvp_holmat: state.getIsAttendHolmat(),
              n_rsvp_holmat_wa: state.getNRsvpHolmat(),
              rsvp_dinner: state.getIsAttendDinner(),
              n_rsvp_dinner_wa: state.getNRsvpDinner(),
              guest_names: state.getDinnerNames().toString(),
              updated_at: new Date().toISOString(),
            })
            .eq("wa_number", message.from);
          if (error) throw new Error(error.message);
          return;
        }

        if (response === "tidak") {
          state.reset();

          const reset = new Text("Data Anda telah kami reset! 🐓");
          await this.api.sendMessage(this.whatsappId, message.from, reset);

          /** QUESTION 1 */
          const holmat = new Interactive(
            new ActionButtons(
              new Button("#reply-holmat-1", "YA"),
              new Button("#reply-holmat-2", "TIDAK")
            ),
            new Body(
              "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?"
            )
          );
          await this.api.sendMessage(this.whatsappId, message.from, holmat);

          state.setNextQuestionId(1);
        }
      }
    }
  };

  public sendInitialMessage = async (
    client: Tables<"amarento.id_clients">,
    guest: Tables<"amarento.id_guests">
  ): Promise<void> => {
    /** construct template. */
    const message = new Template(
      "amarento_hello",
      new Language("id"),
      new HeaderComponent(
        new HeaderParameter(
          combineNames(client.name_groom ?? "", client.name_bride ?? "")
        )
      ),
      new BodyComponent(
        new BodyParameter(guest.inv_names),
        new BodyParameter(`${client.name_groom} and ${client.name_bride}`),
        new BodyParameter(client.parents_name_groom ?? ""),
        new BodyParameter(client.parents_name_bride ?? ""),
        new BodyParameter(client.wedding_day?.toString() ?? ""),
        new BodyParameter(client.holmat_location ?? ""),
        new BodyParameter(new DateTime(client.holmat_time ?? "")),
        new BodyParameter(client.dinner_location ?? ""),
        new BodyParameter(new DateTime(client.dinner_time ?? "")),
        new BodyParameter(guest.n_rsvp_plan.toString())
      ),
      new URLComponent("/")
    );

    /** send initial message. */
    const response = await this.api.sendMessage(
      this.whatsappId,
      guest.wa_number,
      message
    );

    logWithTimestamp(
      `Initial message sent with response. ${JSON.stringify(response)}`
    );
  };

  public sendReminder = async (
    client: Tables<"amarento.id_clients">,
    guest: Tables<"amarento.id_guests">,
    sendQR: boolean = true
  ) => {
    if (!sendQR) {
      /** construct template. */
      const message = new Template(
        "amarento_reminder_textonly",
        new Language("id"),
        new HeaderComponent(
          new HeaderParameter(
            combineNames(client.name_groom ?? "", client.name_bride ?? "")
          )
        ),
        new BodyComponent(
          new BodyParameter(guest.inv_names),
          new BodyParameter(`${client.name_groom} and ${client.name_bride}`),
          new BodyParameter(client.parents_name_groom ?? ""),
          new BodyParameter(client.parents_name_bride ?? ""),
          new BodyParameter(client.holmat_location ?? ""),
          new BodyParameter(new DateTime(client.holmat_time ?? "")),
          new BodyParameter(client.dinner_location ?? ""),
          new BodyParameter(new DateTime(client.dinner_time ?? "")),
          new BodyParameter(guest.n_rsvp_plan.toString()),
          new BodyParameter(
            combineNames(client.name_groom ?? "", client.name_bride ?? "")
          )
        )
      );

      /** send template message. */
      const response = await this.api.sendMessage(
        this.whatsappId,
        guest.wa_number,
        message
      );
      logWithTimestamp(
        `Reminder message sent with response. ${JSON.stringify(response)}`
      );

      return { success: true, message: null };
    }

    /** create qr code */
    logWithTimestamp(`Creating QR code for guest with id ${guest.id}`);
    const url = `https://amarento.id/clients/${client.client_code}/${guest.id}`;
    const fileName = `./invitations/qr-${client.client_code}-${guest.id}.png`;
    pathExist(fileName);

    /** generate invitation image. */
    const generateResponse = await generateInvitation(
      "./images/background.jpg",
      guest.inv_names,
      guest.n_rsvp_plan.toString(),
      url,
      fileName
    );
    if (!generateResponse.success) return generateResponse;

    /** upload invitation to whatsapp. */
    const form = new FormData();
    form.append("file", fs.createReadStream(fileName));
    form.append("type", "image/png");
    form.append("messaging_product", "whatsapp");
    const { id } = (await this.api.uploadMedia(
      this.whatsappId,
      form
    )) as ServerMedia;

    /** construct template. */
    const message = new Template(
      "amarento_reminder",
      new Language("id"),
      new HeaderComponent(new HeaderParameter(new Image(id, true))),
      new BodyComponent(
        new BodyParameter(guest.inv_names),
        new BodyParameter(`${client.name_groom} and ${client.name_bride}`),
        new BodyParameter(client.parents_name_groom ?? ""),
        new BodyParameter(client.parents_name_bride ?? ""),
        new BodyParameter(client.holmat_location ?? ""),
        new BodyParameter(new DateTime(client.holmat_time ?? "")),
        new BodyParameter(client.dinner_location ?? ""),
        new BodyParameter(new DateTime(client.dinner_time ?? "")),
        new BodyParameter(guest.n_rsvp_plan.toString()),
        new BodyParameter(
          combineNames(client.name_groom ?? "", client.name_bride ?? "")
        )
      )
    );

    /** send template message. */
    const response = await this.api.sendMessage(
      this.whatsappId,
      guest.wa_number,
      message
    );
    logWithTimestamp(
      `Reminder message sent with response. ${JSON.stringify(response)}`
    );

    return { success: true, message: null };
  };
}
