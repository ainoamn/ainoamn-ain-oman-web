// src/pages/api/ai/translate.ts - API للترجمة بالذكاء الاصطناعي
import type { NextApiRequest, NextApiResponse } from 'next';
import { SupportedLang } from '@/lib/i18n-enhanced';

// Cache للترجمات
const translationCache = new Map<string, string>();

// أسماء اللغات للـ AI
const LANG_NAMES: Record<SupportedLang, string> = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  hi: 'Hindi',
  ur: 'Urdu',
  fa: 'Persian',
  zh: 'Chinese',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing text or targetLang' });
    }

    if (!Object.keys(LANG_NAMES).includes(targetLang)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // التحقق من الـ cache
    const cacheKey = `${text}:${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return res.json({
        translatedText: translationCache.get(cacheKey),
        cached: true,
      });
    }

    // استخدام Google Generative AI للترجمة
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      // Fallback: استخدام ترجمة بسيطة أو إرجاع النص الأصلي
      console.warn('GOOGLE_AI_API_KEY not set, returning original text');
      return res.json({
        translatedText: text,
        cached: false,
        note: 'Translation service not configured',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Translate the following text to ${LANG_NAMES[targetLang as SupportedLang]}. 
Only return the translated text, nothing else.

Text to translate: "${text}"

Translation:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    // حفظ في الـ cache
    translationCache.set(cacheKey, translatedText);

    // تنظيف الـ cache كل 1000 ترجمة
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    return res.json({
      translatedText,
      cached: false,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    
    // Fallback: إرجاع النص الأصلي
    return res.json({
      translatedText: req.body.text || '',
      cached: false,
      error: error.message,
    });
  }
}






