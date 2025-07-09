import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

export async function detectLabelsFromContent(base64Content: string): Promise<string[]> {
  try {
    const [result] = await client.annotateImage({
      image: { content: base64Content },
      features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
      imageContext: { languageHints: ['zh-TW', 'zh'] },
    });
    return (
      result.labelAnnotations?.map((l) => l.description ?? '').filter(Boolean) ?? []
    );
  } catch (e) {
    console.error('Vision error', e);
    return [];
  }
}