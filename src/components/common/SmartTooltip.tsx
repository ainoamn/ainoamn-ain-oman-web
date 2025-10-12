// src/components/common/SmartTooltip.tsx - نظام التلميحات التوضيحية الذكية
import React, { useState } from 'react';
import { FiInfo, FiHelpCircle } from 'react-icons/fi';

interface SmartTooltipProps {
  term: string;
  explanation: string;
  details?: string;
  example?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

// قاعدة بيانات المصطلحات المحاسبية
export const ACCOUNTING_TERMS: Record<string, {
  ar: string;
  explanation: string;
  details?: string;
  example?: string;
}> = {
  'balance_sheet': {
    ar: 'الميزانية العمومية',
    explanation: 'قائمة مالية تعرض أصول وخصوم وحقوق ملكية الشركة في تاريخ محدد',
    details: 'تعتبر من أهم القوائم المالية وتوضح المركز المالي للشركة. يجب أن تتوازن (الأصول = الخصوم + حقوق الملكية)',
    example: 'إذا كانت الأصول 100,000 ر.ع والخصوم 60,000 ر.ع، فإن حقوق الملكية = 40,000 ر.ع'
  },
  'income_statement': {
    ar: 'قائمة الدخل',
    explanation: 'قائمة مالية تعرض الإيرادات والمصروفات وصافي الربح/الخسارة خلال فترة معينة',
    details: 'تُظهر أداء الشركة المالي. صافي الربح = الإيرادات - المصروفات',
    example: 'إيرادات 50,000 ر.ع - مصروفات 30,000 ر.ع = ربح 20,000 ر.ع'
  },
  'cash_flow': {
    ar: 'قائمة التدفقات النقدية',
    explanation: 'قائمة توضح حركة النقد (الداخل والخارج) من أنشطة التشغيل والاستثمار والتمويل',
    details: 'تساعد في معرفة قدرة الشركة على توليد النقد والوفاء بالتزاماتها',
    example: 'تدفقات تشغيلية +40,000 - استثمارية -15,000 = صافي +25,000 ر.ع'
  },
  'current_assets': {
    ar: 'الأصول المتداولة',
    explanation: 'أصول يمكن تحويلها إلى نقد خلال سنة أو أقل',
    details: 'تشمل: النقدية، المدينون، المخزون، المصروفات المدفوعة مقدماً',
    example: 'نقدية 50,000 + مدينون 30,000 = أصول متداولة 80,000 ر.ع'
  },
  'fixed_assets': {
    ar: 'الأصول الثابتة',
    explanation: 'أصول طويلة الأجل تستخدم في النشاط لأكثر من سنة',
    details: 'تشمل: العقارات، المعدات، السيارات. تخضع للإهلاك',
    example: 'عقار بـ 500,000 ر.ع - إهلاك متراكم 50,000 = قيمة دفترية 450,000 ر.ع'
  },
  'liabilities': {
    ar: 'الخصوم',
    explanation: 'التزامات مالية على الشركة تجاه الغير',
    details: 'تشمل: الدائنون، القروض، المصروفات المستحقة',
    example: 'قرض بنكي 200,000 + دائنون 50,000 = خصوم 250,000 ر.ع'
  },
  'equity': {
    ar: 'حقوق الملكية',
    explanation: 'حقوق أصحاب الشركة في أصولها بعد خصم الخصوم',
    details: 'حقوق الملكية = الأصول - الخصوم. تشمل: رأس المال، الأرباح المحتجزة',
    example: 'أصول 500,000 - خصوم 300,000 = حقوق ملكية 200,000 ر.ع'
  },
  'accounts_receivable': {
    ar: 'المدينون',
    explanation: 'مبالغ مستحقة على العملاء نتيجة مبيعات أو خدمات على الحساب',
    details: 'تمثل ديون للشركة على الغير. يجب متابعتها لضمان التحصيل',
    example: 'فواتير بـ 30,000 ر.ع لم تُحصّل بعد'
  },
  'accounts_payable': {
    ar: 'الدائنون',
    explanation: 'مبالغ مستحقة للموردين نتيجة مشتريات أو خدمات على الحساب',
    details: 'تمثل ديون على الشركة للغير. يجب السداد في موعدها',
    example: 'فواتير موردين بـ 20,000 ر.ع لم تُسدد بعد'
  },
  'depreciation': {
    ar: 'الإهلاك',
    explanation: 'انخفاض قيمة الأصل الثابت بسبب الاستخدام أو مرور الزمن',
    details: 'يُحسب سنوياً ويُسجل كمصروف. يقلل من قيمة الأصل الدفترية',
    example: 'سيارة بـ 20,000 ر.ع، إهلاك سنوي 4,000 ر.ع (عمر 5 سنوات)'
  },
  'trial_balance': {
    ar: 'ميزان المراجعة',
    explanation: 'كشف بأرصدة جميع الحسابات (مدين ودائن) للتأكد من التوازن المحاسبي',
    details: 'مجموع المدين يجب أن يساوي مجموع الدائن. يُستخدم قبل إعداد القوائم المالية',
    example: 'إجمالي مدين 500,000 = إجمالي دائن 500,000 ✓'
  },
  'journal_entry': {
    ar: 'القيد المحاسبي',
    explanation: 'تسجيل محاسبي لمعاملة مالية بنظام القيد المزدوج',
    details: 'كل قيد يحتوي على طرف مدين وطرف دائن بنفس المبلغ',
    example: 'من ح/ النقدية (مدين 1,000) إلى ح/ الإيرادات (دائن 1,000)'
  },
  'cost_center': {
    ar: 'مركز التكلفة',
    explanation: 'قسم أو وحدة في الشركة تُسجل لها التكاليف والإيرادات بشكل منفصل',
    details: 'يساعد في تحليل الربحية لكل قسم أو مشروع',
    example: 'مركز تكلفة: فرع مسقط، فرع صلالة، مشروع البناء'
  },
  'fiscal_year': {
    ar: 'السنة المالية',
    explanation: 'فترة 12 شهر تُعد عنها القوائم المالية',
    details: 'قد تبدأ في يناير أو في أي شهر آخر حسب نظام الشركة',
    example: 'السنة المالية: من 1 يناير 2025 إلى 31 ديسمبر 2025'
  },
  'vat': {
    ar: 'ضريبة القيمة المضافة',
    explanation: 'ضريبة غير مباشرة تُفرض على السلع والخدمات',
    details: 'في عُمان: لم تُطبق بعد. في الخليج: 5% في معظم الدول',
    example: 'فاتورة 1,000 ر.ع + ضريبة 5% = 1,050 ر.ع'
  }
};

export default function SmartTooltip({
  term,
  explanation,
  details,
  example,
  position = 'top',
  children
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // التحقق من إعدادات المستخدم
  const [tooltipsEnabled, setTooltipsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tooltipsEnabled') !== 'false';
    }
    return true;
  });

  if (!tooltipsEnabled) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center gap-1 cursor-help"
      >
        {children}
        <FiHelpCircle className="w-4 h-4 text-blue-500 opacity-60" />
      </div>

      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50 w-80`}>
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 border border-gray-700">
            {/* العنوان */}
            <div className="flex items-start gap-2 mb-3">
              <FiInfo className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-300 mb-1">{term}</h4>
                <p className="text-sm text-gray-200 leading-relaxed">{explanation}</p>
              </div>
            </div>

            {/* التفاصيل */}
            {details && (
              <div className="mb-3 pb-3 border-b border-gray-700">
                <p className="text-xs text-gray-300 leading-relaxed">{details}</p>
              </div>
            )}

            {/* مثال */}
            {example && (
              <div className="bg-blue-900 bg-opacity-30 rounded p-2 border border-blue-700">
                <p className="text-xs text-blue-200 font-medium mb-1">مثال:</p>
                <p className="text-xs text-gray-300">{example}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// مكون لتبديل التلميحات
export function TooltipToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tooltipsEnabled') !== 'false';
    }
    return true;
  });

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tooltipsEnabled', String(newState));
      window.location.reload(); // إعادة تحميل لتطبيق التغيير
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        enabled 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      title={enabled ? 'إيقاف التلميحات التوضيحية' : 'تفعيل التلميحات التوضيحية'}
    >
      <FiHelpCircle className="w-5 h-5" />
      <span className="text-sm">
        التلميحات: {enabled ? 'مفعّلة' : 'معطّلة'}
      </span>
    </button>
  );
}

// مكون مُبسط للاستخدام السريع
export function AccountingTerm({ termKey, children }: { termKey: string; children: React.ReactNode }) {
  const termData = ACCOUNTING_TERMS[termKey];
  
  if (!termData) {
    return <>{children}</>;
  }

  return (
    <SmartTooltip
      term={termData.ar}
      explanation={termData.explanation}
      details={termData.details}
      example={termData.example}
    >
      {children}
    </SmartTooltip>
  );
}

