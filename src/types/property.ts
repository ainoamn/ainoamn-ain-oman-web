export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrl?: string;
  rating?: number;
  isFeatured?: boolean;
  // أضف أي خصائص أخرى مستخدمة في المكون PropertyCard
}