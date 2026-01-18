
import { GoogleGenAI, Modality } from "@google/genai";
import { Character, Message } from "../types";
import { SYSTEM_PROMPT_TEMPLATE } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function getChatResponse(
  character: Character,
  history: Message[],
  userInput: string,
  affinity: number
): Promise<{ text: string; imagePrompt?: string; sources?: any[] }> {
  const ai = getAI();
  const systemInstruction = SYSTEM_PROMPT_TEMPLATE(character, affinity);
  
  const contents = history.slice(-10).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: userInput }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        tools: [{ googleSearch: {} }] // Enabled for date ideas
      }
    });

    const fullText = response.text || "Main thoda daydream kar rahi thi... what did you say?";
    const imageTagMatch = fullText.match(/\[GENERATE_IMAGE: (.*?)\]/);
    const cleanedText = fullText.replace(/\[GENERATE_IMAGE: (.*?)\]/g, '').trim();
    const imagePrompt = imageTagMatch ? imageTagMatch[1] : undefined;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text: cleanedText, imagePrompt, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Network thoda slow hai yaar, can you say that again? ❤️" };
  }
}

export async function generateCharacterImage(prompt: string): Promise<string | undefined> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return undefined;
}

export async function generateSpeech(text: string, voiceName: string): Promise<AudioBuffer | undefined> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = decode(base64Audio);
      return await decodeAudioData(bytes, audioContext, 24000, 1);
    }
  } catch (error) {
    console.error("TTS Generation Error:", error);
  }
  return undefined;
}
