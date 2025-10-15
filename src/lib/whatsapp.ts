// src/lib/whatsapp.ts - تكامل WhatsApp
export class WhatsAppService {
  private static apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
  private static businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE || '96899999999';

  // إرسال رسالة عن عقار
  static sendPropertyInquiry(property: any, message?: string) {
    const propertyTitle = property.titleAr || property.title?.ar || property.titleEn || 'عقار';
    const price = property.priceOMR || property.rentalPrice || 'غير محدد';
    
    const defaultMessage = `مرحباً، أنا مهتم بـ:\n\n📍 ${propertyTitle}\n💰 السعر: ${price} ر.ع\n🆔 رقم المرجع: ${property.referenceNo || property.id}\n\nأرغب في معرفة المزيد من التفاصيل.`;
    
    const text = message || defaultMessage;
    const url = `${this.apiUrl}?phone=${this.businessPhone}&text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
  }

  // إرسال رسالة حجز
  static sendBookingRequest(property: any, userData: any) {
    const message = `🏠 طلب حجز جديد\n\n` +
      `📍 العقار: ${property.titleAr || property.title?.ar}\n` +
      `💰 السعر: ${property.priceOMR || property.rentalPrice} ر.ع\n` +
      `👤 الاسم: ${userData.name}\n` +
      `📧 البريد: ${userData.email}\n` +
      `📱 الهاتف: ${userData.phone}\n\n` +
      `أرغب في حجز هذا العقار.`;
    
    const url = `${this.apiUrl}?phone=${this.businessPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // مشاركة عقار عبر WhatsApp
  static shareProperty(property: any, shareUrl: string) {
    const message = `🏠 شاهد هذا العقار الرائع!\n\n` +
      `📍 ${property.titleAr || property.title?.ar}\n` +
      `💰 ${property.priceOMR || property.rentalPrice} ر.ع\n` +
      `🔗 ${shareUrl}\n\n` +
      `من خلال عين عُمان`;
    
    const url = `${this.apiUrl}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // طلب معاينة
  static requestViewing(property: any, preferredDate: string, preferredTime: string) {
    const message = `📅 طلب معاينة عقار\n\n` +
      `📍 العقار: ${property.titleAr || property.title?.ar}\n` +
      `🆔 المرجع: ${property.referenceNo || property.id}\n` +
      `📅 التاريخ المفضل: ${preferredDate}\n` +
      `🕐 الوقت المفضل: ${preferredTime}\n\n` +
      `أرغب في تحديد موعد للمعاينة.`;
    
    const url = `${this.apiUrl}?phone=${this.businessPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // إرسال استفسار عام
  static sendGeneralInquiry(message: string) {
    const url = `${this.apiUrl}?phone=${this.businessPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // التحقق من دعم WhatsApp
  static isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  // فتح محادثة WhatsApp مباشرة
  static openChat(phoneNumber?: string) {
    const phone = phoneNumber || this.businessPhone;
    const url = `${this.apiUrl}?phone=${phone}`;
    window.open(url, '_blank');
  }
}

// Hook للاستخدام في React Components
export function useWhatsApp() {
  return {
    sendPropertyInquiry: WhatsAppService.sendPropertyInquiry,
    sendBookingRequest: WhatsAppService.sendBookingRequest,
    shareProperty: WhatsAppService.shareProperty,
    requestViewing: WhatsAppService.requestViewing,
    sendGeneralInquiry: WhatsAppService.sendGeneralInquiry,
    openChat: WhatsAppService.openChat,
    isSupported: WhatsAppService.isSupported(),
  };
}

