import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, text, sourceLang, targetLang } = req.body;

    if (!genAI || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    let result;

    switch (action) {
      case 'translate':
        // ترجمة من العربية إلى الإنجليزية أو العكس
        if (sourceLang === 'ar' && targetLang === 'en') {
          prompt = `Translate the following Arabic text to English. Provide only the translation, no explanations:
          
${text}

Translation:`;
        } else if (sourceLang === 'en' && targetLang === 'ar') {
          prompt = `ترجم النص الإنجليزي التالي إلى العربية. قدم الترجمة فقط بدون شرح:
          
${text}

الترجمة:`;
        } else {
          return res.status(400).json({ error: 'Invalid translation direction' });
        }
        result = await model.generateContent(prompt);
        return res.status(200).json({ 
          text: result.response.text().trim(),
          action: 'translate'
        });

      case 'improve':
        // تحسين وصياغة النص
        const improveLang = sourceLang || 'ar';
        if (improveLang === 'ar') {
          prompt = `قم بتحسين وصياغة النص التالي باللغة العربية بشكل احترافي وقانوني. استخدم لغة واضحة ودقيقة. لا تغير المعنى الأساسي:
          
${text}

النص المحسّن:`;
        } else {
          prompt = `Improve and professionally rewrite the following English text. Use clear and precise legal language. Do not change the core meaning:
          
${text}

Improved text:`;
        }
        result = await model.generateContent(prompt);
        return res.status(200).json({ 
          text: result.response.text().trim(),
          action: 'improve'
        });

      case 'correct':
        // تصحيح النص
        const correctLang = sourceLang || 'ar';
        if (correctLang === 'ar') {
          prompt = `قم بتصحيح الأخطاء الإملائية والنحوية في النص التالي بالعربية. أعد النص المصحح فقط دون شرح:
          
${text}

النص المصحح:`;
        } else {
          prompt = `Correct spelling and grammar errors in the following English text. Return only the corrected text without explanations:
          
${text}

Corrected text:`;
        }
        result = await model.generateContent(prompt);
        return res.status(200).json({ 
          text: result.response.text().trim(),
          action: 'correct'
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('AI API error:', error);
    return res.status(500).json({ 
      error: 'AI service error', 
      message: error.message || 'Unknown error'
    });
  }
}

