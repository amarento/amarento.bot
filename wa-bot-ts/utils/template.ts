/** holy matrimony */
export const question1 = "Apakah Anda akan menghadiri Holy Matrimony?";
export const question2 = (n_rsvp: number) =>
  `Anda mendapatkan ${n_rsvp} RSVP di acara Holy Matrimony. \nBerapa orang yang akan menghadiri Holy Matrimony?`;
export const question3 = (index: number) => {
  let prefix = "";
  if (index == 1) prefix = "pertama";
  if (index == 2) prefix = "kedua";
  if (index == 3) prefix = "ketiga";
  if (index == 4) prefix = "keempat";

  `Nama undangan ${prefix} yang akan hadir: `;
};

/** wedding ceremony */
export const question4 = (n_rsvp: number) =>
  `Kamu mendapatkan ${n_rsvp} RSVP di acara Wedding Ceremony. \nBerapa orang yang akan menghadiri Wedding Ceremony?`;
