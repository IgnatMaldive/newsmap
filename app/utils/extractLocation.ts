import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractLocation(content: string): Promise<[number, number] | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts location information from text. Respond with only the latitude and longitude of the primary location mentioned in the text, separated by a comma. If no location is found, respond with 'None'."
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0,
      max_tokens: 20,
    });

    const result = response.choices[0].message.content?.trim();

    if (result && result !== 'None') {
      const [lat, lng] = result.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting location:', error);
    return null;
  }
}

