import fs from "fs";
import Jimp from "jimp";
import { DateTime } from "luxon";
import path from "path";
import QRCode from "qrcode";
import { supabase } from "../supabase";

export function indexToAlphabet(index: number): string {
  if (index < 1 || index > 26) {
    throw new Error("Index must be between 1 and 26");
  }
  return String.fromCharCode(96 + index);
}

/** method to parse names from user. */
export function parseNamesFromInput(
  input: string,
  n_rsvp: number
): { error: { isError: boolean; message: string | null }; names: string[] } {
  /** split the input by comas.
   * The correct name inputs would be names separated by commas, like this:
   * Felix Arjuna, Steffen Josua, Aaron Randy
   */
  const namePairs = input.split(",");
  const names = namePairs.map((pair) => {
    /** trim whitespaces from each name */
    const names = pair
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    return names;
  });

  /** validate the number of names */
  if (names.length != n_rsvp) {
    return {
      error: {
        isError: true,
        message: `Jumlah nama yang dimasukkan tidak sesuai dengan jumlah peserta. Silahkan coba lagi.`,
      },
      names: [],
    };
  }

  return { error: { isError: false, message: null }, names };
}

export async function getRSVPNumber(waNumber: string) {
  const { data, error } = await supabase
    .from("amarento.id_guests")
    .select("n_rsvp_plan")
    .eq("wa_number", waNumber);
  if (error)
    throw new Error(`Error when fetching the number of RSVP for ${waNumber}.`);

  const nRSVP = data.at(0)?.n_rsvp_plan;
  if (nRSVP === undefined)
    throw new Error(`RSVP number could not be undefined. Context: ${waNumber}`);
  return nRSVP;
}

export function mapToArray<K, V>(map: Map<K, V>): Array<{ key: K; value: V }> {
  return Array.from(map, ([key, value]) => ({ key, value }));
}

/** method to combine first names. used in reminder message. */
export function combineNames(groom: string, bride: string): string {
  /** method to extract first name. */
  function getFirstName(name: string): string {
    const parts = name.trim().split(" ");
    return parts.length > 1 ? parts[0] : name;
  }

  return `${getFirstName(groom)} and ${getFirstName(bride)}`;
}

/** method to log message with timestamp. */
export function logWithTimestamp(message: string): void {
  const timestamp = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");

  console.log(`[${timestamp}] ${message}`);
}

/** method to validate path existence. */
export function pathExist(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** method to generate invitation. */
export async function generateInvitation(
  background: string,
  name: string,
  guestId: string,
  url: string,
  output: string
) {
  /** load background. */
  const bg = await Jimp.read(background);

  /** generate qr code. */
  const size = Math.min(bg.getWidth(), bg.getHeight()) / 2;
  const dataURL = await QRCode.toDataURL(url, {
    width: size,
  });
  const qr = await Jimp.read(Buffer.from(dataURL.split(",")[1], "base64"));

  /** calculate positions. */
  const x = (bg.getWidth() - size) / 2;
  const y = (bg.getHeight() - size) / 2;

  /** composite qr code into the background. */
  bg.composite(qr, x, y - 50);

  /** load font */
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  /** add guest name. */
  bg.print(
    smallFont,
    0,
    y + size - 60,
    {
      text: `${name}`,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    bg.getWidth()
  );

  /** add rsvp pax. */
  bg.print(
    smallFont,
    0,
    y + size,
    {
      text: "Valid for 2 pax",
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    bg.getWidth()
  );

  /** save the invitation as iamge file. */
  await bg.writeAsync(`invitations/${output}-${guestId}.png`);

  console.log(`Invitation generated: ${output}`);
}
