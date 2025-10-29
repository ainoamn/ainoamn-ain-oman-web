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
    
    // Use only models that are confirmed to work with v1beta API
    // Gemini 1.5 Pro and Flash are the current stable models
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro-vision'  // Fallback option
    ];
    
    let lastError: any = null;
    
    // Try each model until one works
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Trying model: ${modelName}`);
        
        // Generate prompt based on action
        let prompt = '';
        switch (action) {
          case 'translate':
            if (sourceLang === 'ar' && targetLang === 'en') {
              prompt = `Translate the following Arabic text to English. Provide only the translation, no explanations or additional text:

${text}`;
            } else if (sourceLang === 'en' && targetLang === 'ar') {
              prompt = `ترجم النص الإنجليزي التالي إلى العربية. قدم الترجمة فقط بدون شرح أو نص إضافي:

${text}`;
            } else {
              return res.status(400).json({ error: 'Invalid translation direction' });
            }
            break;
          case 'improve':
            const improveLang = sourceLang || 'ar';
            if (improveLang === 'ar') {
              prompt = `قم بتحسين وصياغة النص التالي باللغة العربية بشكل احترافي وقانوني. استخدم لغة واضحة ودقيقة. لا تغير المعنى الأساسي. أعد النص المحسّن فقط بدون شرح:

${text}`;
            } else {
              prompt = `Improve and professionally rewrite the following English text. Use clear and precise legal language. Do not change the core meaning. Return only the improved text without explanations:

${text}`;
            }
            break;
          case 'correct':
            const correctLang = sourceLang || 'ar';
            if (correctLang === 'ar') {
              prompt = `قم بتصحيح الأخطاء الإملائية والنحوية في النص التالي بالعربية. أعد النص المصحح فقط دون شرح أو علامات:

${text}`;
            } else {
              prompt = `Correct spelling and grammar errors in the following English text. Return only the corrected text without explanations or labels:

${text}`;
            }
            break;
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        // Try to generate content
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Clean the response based on action
        let cleanedText = responseText;
        if (action === 'translate') {
          cleanedText = responseText.replace(/^(Translation|الترجمة):\s*/i, '').trim();
        } else if (action === 'improve') {
          cleanedText = responseText.replace(/^(النص المحسّن|Improved text):\s*/i, '').trim();
        } else if (action === 'correct') {
          cleanedText = responseText.replace(/^(النص المصحح|Corrected text):\s*/i, '').trim();
        }
        
        console.log(`Successfully used model: ${modelName}`);
        return res.status(200).json({ 
          text: cleanedText || responseText,
          action,
          model: modelName
        });
        
      } catch (err: any) {
        lastError = err;
        const errorMsg = err.message || String(err);
        console.log(`Model ${modelName} failed: ${errorMsg}`);
        
        // If it's a 404 error, continue to next model
        // If it's another error (like API key issue), return immediately
        if (errorMsg.includes('404') || errorMsg.includes('not found')) {
          continue; // Try next model
        } else if (errorMsg.includes('API key') || errorMsg.includes('permission') || errorMsg.includes('401') || errorMsg.includes('403')) {
          // API key or permission issue - don't try other models
          return res.status(500).json({ 
            error: 'API key or permission error', 
            message: errorMsg,
            suggestion: 'Please check your GEMINI_API_KEY and ensure it has access to Gemini models'
          });
        } else {
          // Other errors - continue to next model
          continue;
        }
      }
    }
    
    // If all models failed
    const errorDetail = lastError?.message || 'All models failed';
    return res.status(500).json({ 
      error: 'AI service error', 
      message: errorDetail,
      details: `Tried models: ${modelsToTry.join(', ')}`,
      suggestion: 'Please ensure your API key has access to Gemini 1.5 models. You may need to enable billing in Google AI Studio.'
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    return res.status(500).json({ 
      error: 'AI service error', 
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

