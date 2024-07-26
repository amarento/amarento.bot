export const numberOfGuestQuestion = (
  n_rsvp: number,
  event: "Holy Matrimony" | "Wedding Cerremony"
) =>
  `Anda mendapatkan ${n_rsvp} RSVP di acara ${event}. \nBerapa orang yang akan menghadiri ${event}?`;

export const attendanceNamesQuestion = (index: number) => {
  let example = "";
  if (index == 1) example = "Felix Arjuna";
  if (index == 2) example = "Felix Arjuna, Steffen Josua";
  if (index == 3) example = "Felix Arjuna, Steffen Josua, Aaron Randy";
  if (index == 4) example = "Felix Arjuna, Steffen Josua, Aaron Randy, Ricky Jonathan";
  return `Silahkan tulis nama undangan yang akan hadir dipisah dengan koma seperti contoh di bawah ini. \n${example}`;
};

export const summaryMessage = (
  attendHolMat: boolean,
  n_rsvp_holmat: number,
  attendWedCer: boolean,
  n_rsvp_wedcer: number,
  wedCerNames: string
) => {
  const nameText = wedCerNames.length !== 0 ? `Nama orang yang akan hadir: *${wedCerNames}*` : "";

  return `*Rangkuman/Summary Data*

Kedatangan acara Pemberkatan/Holy Matrimony: *${attendHolMat ? "YA" : "TIDAK"}*
Jumlah orang yang akan hadir: *${n_rsvp_holmat}*

Kedatangan acara Resepsi/Wedding Reception: *${attendWedCer ? "YA" : "TIDAK"}*
Jumlah orang yang akan hadir: *${n_rsvp_wedcer}*
${nameText}

Konfirmasi kembali rangkuman data anda.

Apakah anda ingin melakukan perubahan jawaban untuk RSVP Anda?
Klik *YA*, jika ingin mengulang.
Klik *TIDAK*, jika semua data sudah akurat.
`;
};

export const goodbyeMessage = `Terima kasih telah menyisihkan waktu untuk berpartisipasi dalam proses RSVP.

Kami akan mengirimkan QR-Code untuk confirmasi kehadiran Hari-H.

Sampai jumpa! 💚

Regards,
_*Ricky & Glo*_
`;
