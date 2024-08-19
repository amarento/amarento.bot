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
  if (error) throw new Error(`Error when fetching the number of RSVP for ${waNumber}.`);

  const nRSVP = data.at(0)?.n_rsvp_plan;
  if (nRSVP === undefined) throw new Error(`RSVP number could not be undefined. Context: ${waNumber}`);
  return nRSVP;
}

export function mapToArray<K, V>(map: Map<K, V>): Array<{ key: K; value: V }> {
  return Array.from(map, ([key, value]) => ({ key, value }));
}
