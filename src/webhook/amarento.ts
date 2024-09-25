import FormData from "form-data";
import fs from "fs";
import { WhatsAppAPI } from "whatsapp-api-js/.";
import {
  ActionButtons,
  Body,
  BodyComponent,
  BodyParameter,
  Button,
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
import { Client, Guest } from "../db/schema";
import { getRSVP, updateRSVP } from "../db/webhook";
import { logger } from "../logging/winston";
import UserMessage from "../model/UserMessage";
import UserMessageStore from "../model/UserMessageStore";
import { ButtonMessage, sendInteractiveButtonMessage } from "./message-sender";
import { MessageTemplate } from "./message-template";
import {
  combineNames,
  generateInvitation,
  indexToAlphabet,
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

        const nRSVP = await getRSVP(message.from);
        if (nRSVP instanceof Error) {
          await this.api.sendMessage(
            this.whatsappId,
            message.from,
            new Text("WOE, SORRY POL WOE! GAK HOKI. 🐤")
          );
          logger.error(`[${message.from}] Error on Question 2.`);
          return;
        }

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

        const nRSVP = await getRSVP(message.from);
        if (nRSVP instanceof Error) {
          await this.api.sendMessage(
            this.whatsappId,
            message.from,
            new Text("WOE, SORRY POL WOE! GAK HOKI. 🐤")
          );
          logger.error(`[${message.from}] Error on Question 4.`);
          return;
        }

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
          const nRSVP = await getRSVP(message.from);
          if (nRSVP instanceof Error) {
            await this.api.sendMessage(
              this.whatsappId,
              message.from,
              new Text("WOE, SORRY POL WOE! GAK HOKI. 🐤")
            );
            logger.error(`[${message.from}] Error on Question 5.`);
            return;
          }

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
          const update = updateRSVP(message.from, state);
          if (update instanceof Error) {
            await this.api.sendMessage(
              this.whatsappId,
              message.from,
              new Text("WOE, SORRY POL WOE! GAK HOKI. 🐤")
            );
            logger.error(`[${message.from}] Error when updating RSVP.`);
            return;
          }
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
    client: Client,
    guest: Guest
  ): Promise<void> => {
    /** construct template. */

    const message = new Template(
      "amarento_hello",
      new Language("id"),
      new HeaderComponent(
        new HeaderParameter(
          combineNames(client.nameGroom ?? "", client.nameBride ?? "")
        )
      ),
      new BodyComponent(
        new BodyParameter(guest.invNames),
        new BodyParameter(`${client.nameGroom} and ${client.nameBride}`),
        new BodyParameter(client.parentsNameGroom ?? ""),
        new BodyParameter(client.parentsNameBride ?? ""),
        new BodyParameter(client.weddingDay?.toString() ?? ""),
        new BodyParameter(client.holmatLocation ?? ""),
        new BodyParameter(client.holmatTime?.toISOString() ?? ""),
        new BodyParameter(client.dinnerLocation ?? ""),
        new BodyParameter(client.dinnerTime?.toISOString() ?? ""),
        new BodyParameter(guest.nRSVPPlan.toString())
      ),
      new URLComponent("/")
    );

    /** send initial message. */
    const response = await this.api.sendMessage(
      this.whatsappId,
      guest.waNumber,
      message
    );

    logger.info(
      `Initial message sent with response. ${JSON.stringify(response)}`
    );
  };

  public sendReminder = async (
    client: Client,
    guest: Guest,
    sendQR: boolean = true
  ) => {
    if (!sendQR) {
      /** construct template. */
      const message = new Template(
        "amarento_reminder_textonly",
        new Language("id"),
        new HeaderComponent(
          new HeaderParameter(
            combineNames(client.nameGroom ?? "", client.nameBride ?? "")
          )
        ),
        new BodyComponent(
          new BodyParameter(guest.invNames),
          new BodyParameter(`${client.nameGroom} and ${client.nameBride}`),
          new BodyParameter(client.parentsNameGroom ?? ""),
          new BodyParameter(client.parentsNameBride ?? ""),
          new BodyParameter(client.holmatLocation ?? ""),
          new BodyParameter(client.holmatTime?.toISOString() ?? ""),
          new BodyParameter(client.dinnerLocation ?? ""),
          new BodyParameter(client.dinnerTime?.toISOString() ?? ""),
          new BodyParameter(guest.nRSVPPlan.toString()),
          new BodyParameter(
            combineNames(client.nameGroom ?? "", client.nameBride ?? "")
          )
        )
      );

      /** send template message. */
      const response = await this.api.sendMessage(
        this.whatsappId,
        guest.waNumber,
        message
      );
      logger.info(
        `Reminder message sent with response. ${JSON.stringify(response)}`
      );

      return { success: true, message: null };
    }

    /** create qr code */
    logger.info(`Creating QR code for guest with id ${guest.id}`);
    const url = `https://amarento.id/clients/${client.code}/${guest.id}`;
    const fileName = `./invitations/qr-${client.code}-${guest.id}.png`;
    pathExist(fileName);

    /** generate invitation image. */
    const generateResponse = await generateInvitation(
      "./images/background.jpg",
      guest.invNames,
      guest.nRSVPPlan.toString(),
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
        new BodyParameter(guest.invNames),
        new BodyParameter(`${client.nameGroom} and ${client.nameBride}`),
        new BodyParameter(client.parentsNameGroom ?? ""),
        new BodyParameter(client.parentsNameBride ?? ""),
        new BodyParameter(client.holmatLocation ?? ""),
        new BodyParameter(client.holmatTime?.toISOString() ?? ""),
        new BodyParameter(client.dinnerLocation ?? ""),
        new BodyParameter(client.dinnerTime?.toISOString() ?? ""),
        new BodyParameter(guest.nRSVPPlan.toString()),
        new BodyParameter(
          combineNames(client.nameGroom ?? "", client.nameBride ?? "")
        )
      )
    );

    /** send template message. */
    const response = await this.api.sendMessage(
      this.whatsappId,
      guest.waNumber,
      message
    );
    logger.info(
      `Reminder message sent with response. ${JSON.stringify(response)}`
    );

    return { success: true, message: null };
  };
}
