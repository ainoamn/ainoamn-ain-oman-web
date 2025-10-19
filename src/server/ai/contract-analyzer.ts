// src/server/ai/contract-analyzer.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeContractClauses(contractText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    قم بتحليل عقد الإيجار التالي وقدم تقريراً عن:
    1. البنود الأساسية والعرفية
    2. البنود غير العادية أو التي تحتاج انتباه
    3. النقاط التي قد تحتاج إلى توضيح أو تعديل
    4. التزام العقد بالقوانين المحلية
    
    النص:
    ${contractText}
    
    أعد النتيجة بتنسيق JSON يحتوي على:
    - summary: ملخص عام
    - standardClauses: البنود العادية
    - unusualClauses: البنود غير العادية
    - attentionPoints: النقاط التي تحتاج انتباه
    - compliance: مدى توافق العقد مع القوانين
    - recommendations: التوصيات
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Contract analysis error:", error);
    return {
      summary: "فشل في تحليل العقد",
      standardClauses: [],
      unusualClauses: [],
      attentionPoints: [],
      compliance: "غير معروف",
      recommendations: ["يرجى مراجعة العقد يدوياً"]
    };
  }
}
