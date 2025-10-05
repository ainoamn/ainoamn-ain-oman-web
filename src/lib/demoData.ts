// src/lib/demoData.ts //
export type Prop = {
  id: number;
  serial: string;
  title: string;
  location: string;
  priceOMR: number;
  image: string;
  beds: number;
  baths: number;
  area: number;
  rating: number; // 0..5
  lat: number;
  lng: number;
  type: "apartment" | "villa" | "land" | "office" | "shop";
  purpose: "sale" | "rent" | "investment";
  rentalType?: "daily" | "monthly" | "yearly";
  province: string; state: string; village?: string;
  promoted?: boolean;
  promotedAt?: string; // ISO date
  views?: number;
  amenities?: string[];
  attractions?: string[];
  stats?: { interactions?: number; saves?: number; contacts?: number; };
};

export type Landlord = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  province: string;
  deals: number; // عدد الصفقات
};

export const AMENITIES = ["مصعد", "مواقف", "تكييف مركزي", "مفروش", "مسبح", "حديقة", "مطبخ مجهز", "أمن 24/7", "كاميرات", "إنترنت عالي السرعة"];
export const ATTRACTIONS = ["قريب من البحر", "قريب من المدارس", "قريب من المستشفى", "قريب من المطار", "قريب من المول", "قريب من المنتزه"];

const makeSerial = (prefix: string, id: number) => `${prefix}-${String(id).padStart(7, "0")}`;

export const PROPERTIES: Prop[] = [
  { id: 101, serial: makeSerial("AO-P", 101), title:"شقة فاخرة بإطلالة مدينة", location:"مسقط - الخوير", priceOMR:60000, image:"https://images.unsplash.com/photo-1507089947368-19c1da9775ae", beds:3, baths:2, area:150, rating:4.7, lat:23.592, lng:58.420, type:"apartment", purpose:"sale", province:"مسقط", state:"بوشر", village:"الخوير", promoted:true, promotedAt:"2025-08-10T10:00:00Z", views:880, amenities:["مصعد","مواقف","تكييف مركزي","مطبخ مجهز","إنترنت عالي السرعة"], attractions:["قريب من المول","قريب من المدارس"], stats:{interactions:2200, saves:120, contacts:34} },
  { id: 102, serial: makeSerial("AO-P", 102), title:"فيلا حديثة بحديقة", location:"مسقط - السيب", priceOMR:120000, image:"https://images.unsplash.com/photo-1572120360610-d971b9b78825", beds:5, baths:4, area:320, rating:4.9, lat:23.614, lng:58.545, type:"villa", purpose:"sale", province:"مسقط", state:"السيب", village:"المعبيلة", promoted:false, views:1200, amenities:["مواقف","تكييف مركزي","حديقة","مسبح","أمن 24/7"], attractions:["قريب من المنتزه","قريب من المدارس"], stats:{interactions:3100, saves:260, contacts:80} },
  { id: 103, serial: makeSerial("AO-P", 103), title:"مكتب تجاري راقٍ", location:"مسقط - القرم", priceOMR:650, image:"https://images.unsplash.com/photo-1590642918417-6c07d8f64c3a", beds:0, baths:1, area:95, rating:4.6, lat:23.613, lng:58.517, type:"office", purpose:"rent", rentalType:"monthly", province:"مسقط", state:"بوشر", village:"القرم", promoted:true, promotedAt:"2025-08-05T09:00:00Z", views:640, amenities:["مصعد","إنترنت عالي السرعة","مواقف","كاميرات"], attractions:["قريب من المول","قريب من المستشفى"], stats:{interactions:1750, saves:80, contacts:55} },
  { id: 104, serial: makeSerial("AO-P", 104), title:"محل تجاري في موقع نابض", location:"شمال الباطنة - صحار", priceOMR:350, image:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", beds:0, baths:1, area:65, rating:4.5, lat:24.341, lng:56.731, type:"shop", purpose:"rent", rentalType:"monthly", province:"شمال الباطنة", state:"صحار", village:"الهمبار", promoted:false, views:540, amenities:["مواقف","كاميرات"], attractions:["قريب من المول"], stats:{interactions:980, saves:30, contacts:18} },
  { id: 105, serial: makeSerial("AO-P", 105), title:"فيلا بإطلالة بحرية", location:"ظفار - صلالة", priceOMR:100000, image:"https://images.unsplash.com/photo-1600585153837-2a3e5e4e1c45", beds:6, baths:5, area:360, rating:5.0, lat:17.019, lng:54.089, type:"villa", purpose:"sale", province:"ظفار", state:"صلالة", village:"صلالة الوسطى", promoted:true, promotedAt:"2025-08-11T07:30:00Z", views:2200, amenities:["مسبح","حديقة","مواقف","مفروش","أمن 24/7"], attractions:["قريب من البحر","قريب من المطار"], stats:{interactions:5200, saves:420, contacts:160} },
  { id: 106, serial: makeSerial("AO-P", 106), title:"شقة عملية قرب الخدمات", location:"الداخلية - نزوى", priceOMR:350, image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c", beds:2, baths:2, area:110, rating:4.3, lat:22.933, lng:57.529, type:"apartment", purpose:"rent", rentalType:"monthly", province:"الداخلية", state:"نزوى", village:"فرق", promoted:false, views:410, amenities:["مصعد","مواقف","مطبخ مجهز"], attractions:["قريب من المدارس","قريب من المنتزه"], stats:{interactions:760, saves:22, contacts:12} }
];

export const LANDLORDS: Landlord[] = [
  { id: 1, name: "شركة الأمان العقارية", avatar: "https://images.unsplash.com/photo-1589578527966-261f94c4dc2a", rating: 4.9, province: "مسقط", deals: 320 },
  { id: 2, name: "م. سالم الهنائي", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c", rating: 4.7, province: "مسقط", deals: 110 },
  { id: 3, name: "ظفار هومز", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12", rating: 4.8, province: "ظفار", deals: 190 },
  { id: 4, name: "صحار العقارية", avatar: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d", rating: 4.5, province: "شمال الباطنة", deals: 140 }
];
