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
   *
   */
  const namePairs = input.split(",");
  const names = namePairs.map((pair) => {
    /** trim whitespaces from each name */
    const names = pair.trim();
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
