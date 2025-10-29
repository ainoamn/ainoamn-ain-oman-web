import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, text, sourceLang, targetLang } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure GEMINI_API_KEY in environment variables'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-1.5-flash for faster and more reliable responses
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    let result;

    switch (action) {
      case 'translate':
        // ترجمة من العربية إلى الإنجليزية أو العكس
        if (sourceLang === 'ar' && targetLang === 'en') {
          prompt = `Translate the following Arabic text to English. Provide only the translation, no explanations or additional text:

${text}`;
        } else if (sourceLang === 'en' && targetLang === 'ar') {
          prompt = `ترجم النص الإنجليزي التالي إلى العربية. قدم الترجمة فقط بدون شرح أو نص إضافي:

${text}`;
        } else {
          return res.status(400).json({ error: 'Invalid translation direction' });
        }
        result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();
        // Remove any labels like "Translation:" or "الترجمة:"
        const cleanText = translatedText.replace(/^(Translation|الترجمة):\s*/i, '').trim();
        return res.status(200).json({ 
          text: cleanText || translatedText,
          action: 'translate'
        });

      case 'improve':
        // تحسين وصياغة النص
        const improveLang = sourceLang || 'ar';
        if (improveLang === 'ar') {
          prompt = `قم بتحسين وصياغة النص التالي باللغة العربية بشكل احترافي وقانوني. استخدم لغة واضحة ودقيقة. لا تغير المعنى الأساسي. أعد النص المحسّن فقط بدون شرح:

${text}`;
        } else {
          prompt = `Improve and professionally rewrite the following English text. Use clear and precise legal language. Do not change the core meaning. Return only the improved text without explanations:

${text}`;
        }
        result = await model.generateContent(prompt);
        const improvedText = result.response.text().trim();
        const cleanImprovedText = improvedText.replace(/^(النص المحسّن|Improved text):\s*/i, '').trim();
        return res.status(200).json({ 
          text: cleanImprovedText || improvedText,
          action: 'improve'
        });

      case 'correct':
        // تصحيح النص
        const correctLang = sourceLang || 'ar';
        if (correctLang === 'ar') {
          prompt = `قم بتصحيح الأخطاء الإملائية والنحوية في النص التالي بالعربية. أعد النص المصحح فقط دون شرح أو علامات:

${text}`;
        } else {
          prompt = `Correct spelling and grammar errors in the following English text. Return only the corrected text without explanations or labels:

${text}`;
        }
        result = await model.generateContent(prompt);
        const correctedText = result.response.text().trim();
        const cleanCorrectedText = correctedText.replace(/^(النص المصحح|Corrected text):\s*/i, '').trim();
        return res.status(200).json({ 
          text: cleanCorrectedText || correctedText,
          action: 'correct'
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('AI API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      error: 'AI service error', 
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

