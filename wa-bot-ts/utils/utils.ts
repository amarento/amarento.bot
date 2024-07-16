export interface WhatsAppMessage {
  type: string;
  from: string;
  id: string;
  interactive?: {
    button_reply: {
      id: string;
      title: string;
    };
  };
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
}

export function indexToAlphabet(index: number): string {
  if (index < 1 || index > 26) {
    throw new Error("Index must be between 1 and 26");
  }
  return String.fromCharCode(96 + index);
}
