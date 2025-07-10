import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});


export async function geminiLabels(base64: string): Promise<string[]> {
  try {
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64,
        },
      },
      { text: '請使用繁體中文列出這張圖片可能的 15 個簡短標籤。僅回傳以逗號分隔的詞語，不要有任何前言、編號或額外說明。' },
    ];

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const text = res.text?.trim();
    if (!text) {
      return [];
    }
    // 以逗號或換行分割
    const labels = text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 10);
    return labels;
  } catch (e) {
    console.error('Gemini error', e);
    return [];
  }
} 