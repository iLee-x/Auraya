export interface Product {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  categories: CategorySummary[];
  seller: { id: string; name: string | null } | null;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface Category extends CategorySummary {
  description: string | null;
  parentId: string | null;
  parent?: CategorySummary | null;
  children?: CategorySummary[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    stock: number;
    isActive: boolean;
    images: ProductImage[];
  };
}

export interface Cart {
  id: string;
  userId: string;
  updatedAt: string;
  items: CartItem[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN" | "SELLER";
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
