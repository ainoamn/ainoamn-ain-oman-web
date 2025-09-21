export interface Property {
  id: string;
  title: string;
  price: number;
  priceOMR: number;
  location: string;
  province?: string;
  state?: string;
  images?: string[];
  referenceNo?: string;
  promoted?: boolean;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  baths?: number;
  area?: number;
  imageUrl?: string;
  rating?: number;
  isFeatured?: boolean;
}