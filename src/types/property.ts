export interface Unit {
  id: string;
  unitNo: string;
  status: 'vacant' | 'occupied' | 'reserved';
  images?: string[];
}

export interface ExtraRow {
  id: string;
  label: string;
  value: string;
}

export interface Property {
  id: string;
  title: string;
  name?: string; // Alternative to title
  price: number;
  priceOMR: number;
  location: string;
  address?: string; // Alternative to location
  province?: string;
  state?: string;
  images?: string[];
  image?: string; // Single image
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
  units?: Unit[];
}
