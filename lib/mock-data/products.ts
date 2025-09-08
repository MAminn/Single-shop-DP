export interface Product {
  id: string;
  name: string;
  vendor?: string;
  vendorId?: string;
  variants?: {
    name: string;
    values: string[];
  }[];
  price: number;
  stock: number;
  sold?: number;
  sales?: number;
  revenue?: number;
  category?: string;
  status?: string;
  threshold?: number;
  sku?: string;
  imageUrl?: string;
  dateAdded?: Date;
  categoryName?: string;
  available?: boolean;
  categoryId?: string;
  vendorName?: string;
}

export interface Variant {
  name: string;
  values: string[];
}
