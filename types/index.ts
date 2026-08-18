export interface Category {
  id: number;
  name: string;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  image_url: string;
  image_public_id: string;
  category_id: number | null;
  category_name?: string;
  code: string;
  stock: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppSettings {
  whatsapp_number: string;
}
