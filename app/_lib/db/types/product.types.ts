export interface ProductPageSerialized {
  id: number;
  name: string;
  description: string | null;
  brand: string | null;
  updatedAt: string;

  attributes: {
    id: number;
    key: string;
    value: string;
  }[];

  variants: {
    id: number;
    productId: number;
    price: number | null;
    originalPrice: number | null;
    stock: number;
    sku: string | null;
    optionHash: string;
    updatedAt: string;

    images: string[];

    options: {
      id: number;
      key: string;
      value: string;
    }[];
  }[];

  _count: {
    reviews: number;
  };
}


export interface ProductCardDTO {
  id: number;

  name: string;
  slug: string;

  storeSlug: string;

  variant: {
    id: number;

    price: number | null;
    originalPrice: number | null;

    image: string | null;

    options: {
      key: string;
      value: string;
    }[];
  };

  isLiked?: boolean;
}