import {
  WhatsappNotificationMessage,
  WhatsappNotificationMessageType,
} from "@daweto/whatsapp-api-types";
import UserMessage from "../model/UserMessage";
import UserMessageStore from "../model/UserMessageStore";
import { supabase } from "../supabase";
import { getRSVPNumber, indexToAlphabet, parseNamesFromInput } from "./functions";
import {
  attendanceNamesQuestion,
  goodbyeMessage,
  numberOfGuestQuestion,
  summaryMessage,
} from "./message";
import {
  ButtonMessage,
  markAsRead,
  sendInteractiveButtonMessage,
  sendTextMessage,
} from "./message-sender";

const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";
const READY_MESSAGE = "siap";

export const handleIncomingMessage = async (message?: WhatsappNotificationMessage) => {
  if (message?.from === undefined) return;

  if (message && UserMessageStore.get(message.from) === undefined)
    UserMessageStore.set(message.from, new UserMessage());

  const state = UserMessageStore.get(message!.from);
  if (state === undefined) {
    console.error("State is empty.");
    return;
  }

  if (
    message?.type === WhatsappNotificationMessageType.Button &&
    message.button?.text.toLowerCase() === READY_MESSAGE &&
    state.getNextQuestionId() === 0
  ) {
    const buttons: ButtonMessage[] = [
      {
        type: "reply",
        reply: {
          id: `#reply-holmat-1`,
          title: "YA",
        },
      },
      {
        type: "reply",
        reply: {
          id: `#reply-holmat-2`,
          title: "TIDAK",
        },
      },
    ];
    /** QUESTION 1 */
    await sendInteractiveButtonMessage(
      BUSINESS_PHONE_NUMBER_ID,
      message.from,
      "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?",
      buttons
    );
    state.setNextQuestionId(1);
  }

  if (message === undefined) return;
  switch (state.getNextQuestionId()) {
    case 1: {
      const replyId = message.interactive?.button_reply.id;
      if (replyId === undefined) return;

      /** QUESTION 3 - Are you coming to the wedding ceremony? */
      if (message.interactive?.button_reply.title.toLowerCase() === "tidak") {
        state.setIsAttendHolmat(false);
        const buttons: ButtonMessage[] = [
          {
            type: "reply",
            reply: {
              id: `#reply-wedcer-1`,
              title: "YA",
            },
          },
          {
            type: "reply",
            reply: {
              id: `#reply-wedcer-2`,
              title: "TIDAK",
            },
          },
        ];
        await sendInteractiveButtonMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          "Apakah Anda akan menghadiri acara *Resepsi / Wedding Ceremony*?",
          buttons
        );
        await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
        state.setNextQuestionId(3);
        return;
      }

      /** QUESTION 2 - How many people would come to holy matrimony? */
      state.setIsAttendHolmat(true);

      const nRSVP = await getRSVPNumber(message.from);
      const buttons: ButtonMessage[] = Array.from({ length: nRSVP }, (_, i) => ({
        type: "reply",
        reply: {
          id: `#reply-guest-holmat-${indexToAlphabet(i + 1)}`,
          title: (i + 1).toString(),
        },
      }));
      await sendInteractiveButtonMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        numberOfGuestQuestion(nRSVP, "Holy Matrimony"),
        buttons
      );
      await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
      state.setNextQuestionId(2);
      break;
    }
    case 2: {
      if (message.interactive === undefined) return;
      const nConfirmGuest = parseInt(message.interactive.button_reply.title);
      state.setNRsvpHolmat(nConfirmGuest);
      await sendTextMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        `Thank you for confirming! ${nConfirmGuest} orang akan datang di acara *Pemberkatan / Holy Matrimony*.`
      );

      const buttons: ButtonMessage[] = [
        {
          type: "reply",
          reply: {
            id: `#reply-wedcer-1`,
            title: "YA",
          },
        },
        {
          type: "reply",
          reply: {
            id: `#reply-wedcer-2`,
            title: "TIDAK",
          },
        },
      ];
      await sendInteractiveButtonMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        "Apakah Anda akan menghadiri acara *Resepsi / Wedding Ceremony*?",
        buttons
      );
      await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
      state.setNextQuestionId(3);
      return;
    }
    case 3: {
      /** SUMMARY AND REDO */
      if (message.interactive === undefined) return;
      if (message.interactive?.button_reply.title.toLowerCase() === "tidak") {
        state.setIsAttendDinner(false);
        const buttons: ButtonMessage[] = [
          {
            type: "reply",
            reply: {
              id: `#reply-reset-1`,
              title: "YA",
            },
          },
          {
            type: "reply",
            reply: {
              id: `#reply-reset-2`,
              title: "TIDAK",
            },
          },
        ];
        await sendInteractiveButtonMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          summaryMessage(
            state.getIsAttendHolmat(),
            state.getNRsvpHolmat(),
            state.getIsAttendDinner(),
            state.getNRsvpDinner(),
            state.getDinnerNames().join(", ")
          ),
          buttons
        );
        state.setNextQuestionId(6);
        return;
      }

      state.setIsAttendDinner(true);

      const nRSVP = await getRSVPNumber(message.from);
      const buttons: ButtonMessage[] = Array.from({ length: nRSVP }, (_, i) => ({
        type: "reply",
        reply: {
          id: `#reply-guest-wedcer-${indexToAlphabet(i + 1)}`,
          title: (i + 1).toString(),
        },
      }));
      await sendInteractiveButtonMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        numberOfGuestQuestion(nRSVP, "Wedding Cerremony"),
        buttons
      );
      await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
      state.setNextQuestionId(4);
      break;
    }
    case 4: {
      if (message.interactive === undefined) return;
      const nConfirmGuest = parseInt(message.interactive.button_reply.title);
      state.setNRsvpDinner(nConfirmGuest);
      await sendTextMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        attendanceNamesQuestion(nConfirmGuest),
        message.id
      );
      await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
      state.setNextQuestionId(5);
      return;
    }
    case 5: {
      if (message && message.type === WhatsappNotificationMessageType.Text) {
        const nRSVP = await getRSVPNumber(message.from);
        const body = message.text?.body;
        if (body === undefined) {
          /** REPEAT QUESTION: Please write the name of the attendees  */
          await sendTextMessage(
            BUSINESS_PHONE_NUMBER_ID,
            message.from,
            attendanceNamesQuestion(nRSVP),
            message.id
          );

          return;
        }

        const names = parseNamesFromInput(body, state.getNRsvpDinner());
        if (names.error.isError && names.error.message) {
          await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
          await sendTextMessage(
            BUSINESS_PHONE_NUMBER_ID,
            message.from,
            names.error.message,
            message.id
          );
          /** REPEAT QUESTION: Please write the name of the attendees  */
          await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, message.from, attendanceNamesQuestion(2));
          return;
        }
        state.setDinnerNames(names.names);

        const buttons: ButtonMessage[] = [
          {
            type: "reply",
            reply: {
              id: `#reply-reset-1`,
              title: "YA",
            },
          },
          {
            type: "reply",
            reply: {
              id: `#reply-reset-2`,
              title: "TIDAK",
            },
          },
        ];
        await sendInteractiveButtonMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          summaryMessage(
            state.getIsAttendHolmat(),
            state.getNRsvpHolmat(),
            state.getIsAttendDinner(),
            state.getNRsvpDinner(),
            state.getDinnerNames().join(", ")
          ),
          buttons
        );

        state.setNextQuestionId(6);
      }
    }
    case 6: {
      if (message.interactive === undefined) return;
      const response = message.interactive?.button_reply.title.toLowerCase();
      if (response === "ya") {
        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, message.from, goodbyeMessage);
        state.setNextQuestionId(7);

        /** write response to database */
        const { error } = await supabase
          .from("guests")
          .update({
            rsvp_holmat: state.getIsAttendHolmat(),
            act_n_rsvp_holmat: state.getNRsvpHolmat(),
            rsvp_dinner: state.getIsAttendDinner(),
            act_n_rsvp_dinner: state.getNRsvpDinner(),
            names_wedcer: state.getDinnerNames().join(", "),
            updated_at: new Date().toISOString(),
          })
          .eq("wa_number", message.from);
        if (error) throw new Error(error.message);
        return;
      }

      if (response === "tidak") {
        state.reset();
        const buttons: ButtonMessage[] = [
          {
            type: "reply",
            reply: {
              id: `#reply-holmat-1`,
              title: "YA",
            },
          },
          {
            type: "reply",
            reply: {
              id: `#reply-holmat-2`,
              title: "TIDAK",
            },
          },
        ];

        await sendTextMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          "Data Anda telah kami reset! 🐓"
        );

        /** QUESTION 1 */
        state.setNextQuestionId(1);
        await sendInteractiveButtonMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?",
          buttons
        );
      }
    }
  }
};
