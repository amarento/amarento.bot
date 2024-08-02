export const initialMessage = (
  name: string,
  brideAndGroom: string,
  brideParents: string,
  groomParents: string,
  eventDate: string,
  holmatAdress: string,
  holmatTime: string,
  wedcerAdress: string,
  wedcerTime: string,
  nRSVP: number
) => {
  return `Dear Mr. and Mrs. ${name},

Kami dari Amarento ingin mengkonfirmasi kedatangan Anda di acara pernikahan *${brideAndGroom}*.

Turut berbahagia,
*${brideParents}*
dan
*${groomParents}*

Acara pernikahan akan dilaksanakan pada:
*${eventDate}*

Pemberkatan atau Holy Matrimony:
Tempat: *${holmatAdress}*
Pukul: *${holmatTime}*

Resepsi atau Wedding Reception:
Tempat: *${wedcerAdress}*
Pukul: *${wedcerTime}*

Undangan ini berlaku untuk *${nRSVP}* pax.

Dimohon partisipasinya untuk pengisian rincian undangan dengan cara menjawab pertanyaan-pertanyaan yang akan kami kirimkan melalui percakapan ini. Waktu untuk pengisian kurang lebih 5-10 menit.
Mohon ketik "*YA*" untuk kesediaan Anda untuk berpartisipasi.
`;
};

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
  return `Silahkan tulis nama undangan yang akan hadir dipisah dengan *koma* seperti contoh di bawah ini. \n${example}`;
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

Apakah semua data Anda sudah akurat?
Klik *YA*, jika semua data sudah akurat.
Klik *TIDAK*, jika ada kesalahan dan Anda ingin mengulang.
`;
};

export const goodbyeMessage = `Terima kasih telah menyisihkan waktu untuk berpartisipasi dalam proses RSVP.

Kami akan mengirimkan QR-Code untuk confirmasi kehadiran Hari-H.

Sampai jumpa! 💚

Regards,
_*Ricky & Glo*_
`;
