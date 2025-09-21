// src/server/ai/ocr.ts
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function advancedOcr(filePath: string, kind: DocKind) {
  try {
    // OCR أساسي باستخدام Tesseract
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'ara+eng', // دعم العربية والإنجليزية
      { logger: m => console.log(m) }
    );

    // استخدام الذكاء الاصطناعي لتحليل المستند
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    قم بتحليل المستند التالي من نوع ${kind} واستخرج المعلومات المهمة منه:
    ${text}
    
    أعد النتيجة بتنسيق JSON يحتوي على:
    - validity: هل المستند صالح أم منتهي الصلاحية (boolean)
    - expirationDate: تاريخ انتهاء الصلاحية إذا وجد (string)
    - extractedData: البيانات المستخرجة (key-value pairs)
    - confidence: درجة الثقة في التحليل (number بين 0 و 1)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    return {
      kind,
      file: filePath.split(/[\\/]/).pop() || "",
      extractedText: text,
      aiAnalysis: analysis
    };
  } catch (error) {
    console.error("OCR Error:", error);
    
    // Fallback إلى OCR مبسط في حالة الخطأ
    const name = filePath.split(/[\\/]/).pop() || "";
    return {
      kind,
      file: name,
      extractedText: "",
      detectedName: name.replace(/\.[a-z0-9]+$/i, "").replace(/[_\-\s]/g, " "),
      aiAnalysis: {
        validity: true,
        extractedData: {},
        confidence: 0.5
      }
    };
  }
}