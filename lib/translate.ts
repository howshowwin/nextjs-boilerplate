import { Translate } from '@google-cloud/translate/build/src/v2';

const translateClient = new Translate();

export async function translateToChinese(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  try {
    const targetLanguage = 'zh-TW';
    const [translations] = await translateClient.translate(texts, targetLanguage);

    // translate() 回傳可能是 string 或 string[]，統一轉成陣列
    const array = Array.isArray(translations) ? translations : [translations];

    return array as string[];
  } catch (e) {
    console.error('Translation error', e);
    return texts;
  }
} 