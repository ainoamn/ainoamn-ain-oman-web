import React from 'react';

interface ContractDisplayProps {
  contract: any;
  showCompanyHeader?: boolean;
  className?: string;
}

const ContractDisplay: React.FC<ContractDisplayProps> = ({ 
  contract, 
  showCompanyHeader = true, 
  className = '' 
}) => {
  const getText = (obj: any, lang: 'ar' | 'en' = 'ar'): string => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[lang] || obj.ar || obj.en || '';
    }
    return '';
  };

  return (
    <div className={`contract-display ${className}`}>
      {/* رأس الشركة */}
      {showCompanyHeader && (
        <div className="company-header bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center mb-8">
          <div className="company-name-ar text-3xl font-bold text-gray-900 mb-2">
            مجموعة سيد فياض العالمية ش م م
          </div>
          <div className="company-name-en text-2xl font-bold text-gray-700 mb-4">
            SYED FAYYAZ GROUP INTERNATIONAL L L C
          </div>
          <div className="company-contact text-sm text-gray-600 space-y-1">
            <div>ص.ب: 154 ، الرمز البريدي : 111 ، سلطنة عمان</div>
            <div>P.O.Box : 154 , P.C : 111 ,Sultanate of Oman</div>
            <div>هاتف : +968 24499481 | فاكس : +968 24497482</div>
            <div>Tel.: +968 24499481 | Fax.: +968 24497482</div>
          </div>
        </div>
      )}

      {/* عنوان المستند */}
      <div className="document-title bg-gray-50 p-6 text-center border-b mb-8">
        <div className="document-title-ar text-2xl font-bold text-gray-900 mb-2">
          {getText(contract.name, 'ar') || 'عقد إيجار'}
        </div>
        <div className="document-title-en text-xl font-bold text-gray-700">
          {getText(contract.name, 'en') || 'Rental Agreement'}
        </div>
      </div>

      {/* الأقسام */}
      <div className="space-y-8">
        {contract.content?.sections?.map((section: any, index: number) => (
          <div key={index} className="section">
            {/* عنوان القسم */}
            <div className="section-title bg-gray-100 p-4 rounded-r-lg border-r-4 border-blue-500 mb-4">
              <div className="text-lg font-bold text-gray-900 mb-1" dir="rtl">
                {getText(section.title, 'ar')}
              </div>
              <div className="text-base font-semibold text-gray-700" dir="ltr">
                {getText(section.title, 'en')}
              </div>
            </div>
            
            {/* البنود */}
            <div className="space-y-4">
              {section.clauses?.map((clause: any, clauseIndex: number) => (
                <div key={clauseIndex} className="clause p-4 bg-white border border-gray-200 rounded-lg">
                  {/* البند بالعربية */}
                  <div className="clause-ar text-base leading-relaxed mb-3" dir="rtl">
                    <span className="clause-number font-bold text-blue-600 mr-2">
                      {clauseIndex + 1}.
                    </span>
                    {getText(clause, 'ar')}
                  </div>
                  {/* البند بالإنجليزية */}
                  <div className="clause-en text-sm leading-relaxed text-gray-600" dir="ltr">
                    <span className="clause-number font-bold text-blue-500 mr-2">
                      {clauseIndex + 1}.
                    </span>
                    {getText(clause, 'en')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* قسم التوقيعات */}
      <div className="signature-section mt-12 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="signature-line"></div>
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">توقيع المؤجر</div>
            <div className="text-xs text-gray-500">Lessor Signature</div>
            <div className="text-sm text-gray-600 mt-2">التاريخ: _______________</div>
            <div className="text-xs text-gray-500">Date: _______________</div>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <div className="signature-line"></div>
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">توقيع المستأجر</div>
            <div className="text-xs text-gray-500">Tenant Signature</div>
            <div className="text-sm text-gray-600 mt-2">التاريخ: _______________</div>
            <div className="text-xs text-gray-500">Date: _______________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDisplay;
