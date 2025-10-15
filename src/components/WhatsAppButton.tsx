// src/components/WhatsAppButton.tsx - زر WhatsApp عائم
import React, { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { WhatsAppService } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  property?: any;
  position?: 'bottom-right' | 'bottom-left';
}

export default function WhatsAppButton({ property, position = 'bottom-right' }: WhatsAppButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const positionClasses = position === 'bottom-right' 
    ? 'left-6 bottom-6' 
    : 'right-6 bottom-6';

  const handleClick = () => {
    if (property) {
      setShowMenu(!showMenu);
    } else {
      WhatsAppService.openChat();
    }
  };

  return (
    <>
      {/* القائمة المنبثقة */}
      {showMenu && property && (
        <div className={`fixed ${positionClasses} mb-20 bg-white rounded-2xl shadow-2xl p-4 w-72 animate-scale-in z-50 border-2 border-green-500`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FaWhatsapp className="text-green-600" />
              تواصل معنا
            </h3>
            <button
              onClick={() => setShowMenu(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                WhatsAppService.sendPropertyInquiry(property);
                setShowMenu(false);
              }}
              className="w-full text-right px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-sm font-medium text-gray-700"
            >
              📩 استفسار عن العقار
            </button>
            
            <button
              onClick={() => {
                const url = window.location.href;
                WhatsAppService.shareProperty(property, url);
                setShowMenu(false);
              }}
              className="w-full text-right px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-medium text-gray-700"
            >
              🔗 مشاركة العقار
            </button>
            
            <button
              onClick={() => {
                const date = new Date().toLocaleDateString('ar-SA');
                WhatsAppService.requestViewing(property, date, 'أي وقت');
                setShowMenu(false);
              }}
              className="w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-sm font-medium text-gray-700"
            >
              📅 طلب معاينة
            </button>
            
            <button
              onClick={() => {
                WhatsAppService.openChat();
                setShowMenu(false);
              }}
              className="w-full text-right px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm font-medium text-gray-700"
            >
              💬 محادثة مباشرة
            </button>
          </div>
        </div>
      )}

      {/* الزر العائم */}
      <button
        onClick={handleClick}
        className={`fixed ${positionClasses} bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 group`}
        title="تواصل عبر WhatsApp"
      >
        <FaWhatsapp className="text-3xl group-hover:scale-110 transition-transform" />
        
        {/* نبضة حية */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
      </button>
    </>
  );
}

