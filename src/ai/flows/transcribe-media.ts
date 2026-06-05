'use server';
/**
 * @fileOverview ИИ-поток для транскрибации аудио и видео файлов.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const TranscribeInputSchema = z.object({
  mediaDataUri: z.string().describe("Data URI медиафайла"),
  mimeType: z.string().describe("MIME тип файла")
});

export async function transcribeMedia(input: z.infer<typeof TranscribeInputSchema>) {
  const { mediaDataUri, mimeType } = input;

  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    prompt: [
      { media: { url: mediaDataUri, contentType: mimeType } },
      { text: "Ты — профессиональный медицинский стенографист. Твоя задача: максимально точно перевести это аудио/видео в текст на русском языке. Удали слова-паразиты, но сохрани все медицинские термины и детали. Верни только текст транскрипции." }
    ],
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    }
  });

  return response.text || 'Не удалось распознать голос.';
}
