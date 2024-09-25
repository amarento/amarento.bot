export class MessageTemplate {
  public static numberOfGuest(
    n_rsvp: number,
    event: "Holy Matrimony" | "Wedding Cerremony"
  ): string {
    return `Anda mendapatkan ${n_rsvp} RSVP di acara ${event}. \nBerapa orang yang akan menghadiri ${event}?`;
  }

  public static attendanceNames(index: number): string {
    let example = "";
    switch (index) {
      case 1:
        example = "Felix Arjuna";
        break;
      case 2:
        example = "Felix Arjuna, Steffen Josua";
        break;
      case 3:
        example = "Felix Arjuna, Steffen Josua, Aaron Randy";
        break;
      case 4:
        example = "Felix Arjuna, Steffen Josua, Aaron Randy, Ricky Jonathan";
        break;
    }
    return `Silahkan tulis nama undangan yang akan hadir dipisah dengan *koma* seperti contoh di bawah ini. \n${example}`;
  }

  public static summary(
    attendHolMat: boolean,
    n_rsvp_holmat: number,
    attendWedCer: boolean,
    n_rsvp_wedcer: number,
    wedCerNames: string
  ): string {
    const nameText =
      wedCerNames.length !== 0
        ? `Nama orang yang akan hadir: *${wedCerNames}*`
        : "";

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
  }

  public static readonly goodbye: string = `Terima kasih telah menyisihkan waktu untuk berpartisipasi dalam proses RSVP.

Kami akan mengirimkan QR-Code untuk confirmasi kehadiran Hari-H.

Sampai jumpa! 💚

Regards,
_*Ricky & Glo*_
`;
}
