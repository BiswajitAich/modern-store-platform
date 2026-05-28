export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  parentId: number | null;

  _count: {
    products: number;
  };
}

export interface CategoryCardDTO {
  id: number;
  name: string;
  slug: string;
  storeSlug: string;
  image: string | null;
}