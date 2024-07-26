import {
  WhatsappNotificationMessage,
  WhatsappNotificationMessageType,
  WhatsappNotificationStatus,
  WhatsappNotificationStatusStatus,
} from "@daweto/whatsapp-api-types";
import UserMessage from "../model/UserMessage";
import { indexToAlphabet, parseNamesFromInput } from "./functions";
import {
  attendanceNamesQuestion,
  goodbyeMessage,
  numberOfGuestQuestion,
  summaryMessage,
} from "./message";
import {
  ButtonMessage,
  markAsRead,
  sendInteractiveMessage,
  sendTextMessage,
} from "./message-sender";

const BUSINESS_PHONE_NUMBER_ID: string = "370074172849087";
const userMessages: { [key: string]: UserMessage } = {};

export const handleIncomingMessage = async (
  message?: WhatsappNotificationMessage,
  status?: WhatsappNotificationStatus
) => {
  console.log(userMessages);

  if (status && userMessages[status.recipient_id] === undefined)
    userMessages[status.recipient_id] = new UserMessage();
  if (message && userMessages[message.from] === undefined)
    userMessages[message.from] = new UserMessage();

  const state = userMessages[status?.recipient_id ?? message!.from];
  if (
    status?.status === WhatsappNotificationStatusStatus.Delivered &&
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
    state.setNextQuestionId(1);
    await sendInteractiveMessage(
      BUSINESS_PHONE_NUMBER_ID,
      status.recipient_id,
      "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?",
      buttons
    );
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
        await sendInteractiveMessage(
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

      const n_rsvp = 3;
      const buttons: ButtonMessage[] = Array.from({ length: n_rsvp }, (_, i) => ({
        type: "reply",
        reply: {
          id: `#reply-guest-holmat-${indexToAlphabet(i + 1)}`,
          title: (i + 1).toString(),
        },
      }));
      await sendInteractiveMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        numberOfGuestQuestion(n_rsvp, "Holy Matrimony"),
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
      await sendInteractiveMessage(
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
        state.setIsAttendWedcer(false);
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
        await sendInteractiveMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          summaryMessage(
            state.getIsAttendHolmat(),
            state.getNRsvpHolmat(),
            state.getIsAttendWedcer(),
            state.getNRsvpWedcer(),
            state.getWedcerNames().join(", ")
          ),
          buttons
        );
        state.setNextQuestionId(6);
        return;
      }

      state.setIsAttendWedcer(true);
      const n_rsvp = 3;
      const buttons: ButtonMessage[] = Array.from({ length: n_rsvp }, (_, i) => ({
        type: "reply",
        reply: {
          id: `#reply-guest-wedcer-${indexToAlphabet(i + 1)}`,
          title: (i + 1).toString(),
        },
      }));
      await sendInteractiveMessage(
        BUSINESS_PHONE_NUMBER_ID,
        message.from,
        numberOfGuestQuestion(n_rsvp, "Wedding Cerremony"),
        buttons
      );
      await markAsRead(BUSINESS_PHONE_NUMBER_ID, message.id);
      state.setNextQuestionId(4);
      break;
    }
    case 4: {
      if (message.interactive === undefined) return;
      const nConfirmGuest = parseInt(message.interactive.button_reply.title);
      state.setNRsvpWedcer(nConfirmGuest);
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
        const n_rsvp = 2;
        const body = message.text?.body;
        if (body === undefined) {
          /** REPEAT QUESTION: Please write the name of the attendees  */
          await sendTextMessage(
            BUSINESS_PHONE_NUMBER_ID,
            message.from,
            attendanceNamesQuestion(n_rsvp),
            message.id
          );

          return;
        }

        const names = parseNamesFromInput(body, state.getNRsvpWedcer());
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
        state.setWedcerNames(names.names);

        /** write names to database */
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
        await sendInteractiveMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          summaryMessage(
            state.getIsAttendHolmat(),
            state.getNRsvpHolmat(),
            state.getIsAttendWedcer(),
            state.getNRsvpWedcer(),
            state.getWedcerNames().join(", ")
          ),
          buttons
        );

        state.setNextQuestionId(6);
      }
    }
    case 6: {
      if (message.interactive === undefined) return;
      const response = message.interactive?.button_reply.title.toLowerCase();
      if (response === "tidak") {
        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, message.from, goodbyeMessage);
        state.setNextQuestionId(7);
        return;
      }

      if (response === "ya") {
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
        await sendInteractiveMessage(
          BUSINESS_PHONE_NUMBER_ID,
          message.from,
          "Apakah Anda akan menghadiri acara *Pemberkatan / Holy Matrimony*?",
          buttons
        );
      }
    }
  }
};
