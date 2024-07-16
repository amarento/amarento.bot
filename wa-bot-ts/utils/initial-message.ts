import axios from "axios";

const numbers: string[] = ["4915237363126", "4915901993904", "4917634685672", "4915256917547"];

async function sendWhatsAppMessages(number: string): Promise<void> {
  const token: string =
    "EAATo4FKSZAlkBOxZAaSl0YZAuY3GKUZAykdQVZCjsIaWaVUBzHwIpc84R1fuLIvbTKVKZAVFWkibZAT3TbweFW1nPZAG7H0hdlgjpHOVvgFtOOklrvLx80viU4CgCYK3CIyI5UZBx9ma8Uci1eVFRw5OwKNhjydYfplnuH0aobAkubwYDDmG4IYAlBplUaL8aD12VC6vJ67U1YeKMHUNxJ9SmmimPtv8ryYT4lsptvia433EY38W1aGyy";
  const business_phone_number_id: string = "370074172849087";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const body = {
    messaging_product: "whatsapp",
    to: number,
    type: "template",
    template: {
      name: "template_hello_1_test",
      language: {
        code: "id",
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "text",
              text: "Ricky & Glo",
            },
          ],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: "Aaron Randy" },
            { type: "text", text: "Ricky & Glo" },
            { type: "text", text: "Mr. Papa & Mama" },
            { type: "text", text: "Mr. Papi & Mami" },
            { type: "text", text: "Nama Hari, 01/01/2024" },
            { type: "text", text: "Nama Gereja, Kota" },
            { type: "text", text: "00:00" },
            { type: "text", text: "Nama Tempat, Kota" },
            { type: "text", text: "00:00" },
            { type: "text", text: "2" },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: "/",
            },
          ],
        },
      ],
    },
  };

  try {
    console.log(JSON.stringify(body, null, 2));
    const firstResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${business_phone_number_id}/messages`,
      body,
      { headers }
    );
    console.log(
      "First message sent successfully. Response:",
      JSON.stringify(firstResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Failed to send first message. Error:",
      (error as any).response ? (error as any).response.data : (error as Error).message
    );
  }

  // Wait for 60 seconds
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const question_body = {
    messaging_product: "whatsapp",
    to: number,
    type: "template",
    template: {
      name: "amarento_template_test_holmat",
      language: {
        code: "id",
      },
    },
  };

  try {
    console.log(JSON.stringify(question_body, null, 2));
    const secondResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${business_phone_number_id}/messages`,
      question_body,
      { headers }
    );
    console.log(
      "Second message sent successfully. Response:",
      JSON.stringify(secondResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Failed to send second message. Error:",
      (error as any).response ? (error as any).response.data : (error as Error).message
    );
  }
}

// Example usage:
numbers.map(async (number) => await sendWhatsAppMessages(number));
