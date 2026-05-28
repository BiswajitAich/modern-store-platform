import { CategoryCardData } from "./db/queries/category.query";
import { ProductCardData, ProductPageData, WishlistItemWithRelations } from "./db/queries/product.query";
import { CategoryCardDTO } from "./db/types/category.types";
import { ProductCardDTO, ProductPageSerialized } from "./db/types/product.types";


export function decimalToNumber(
  value: unknown
): number | null {
  if (value == null) return null;
  if (typeof (value as any).toNumber === "function") {
    return (value as any).toNumber();
  }
  const n = Number(value);
  return isNaN(n) ? null : n;
}

// export function serializeCategory(raw: CategoryPageDB): CategoryPage {
//   return {
//     name: raw.name,
//     products: raw.products.map((p) => ({
//       id: p.id,
//       name: p.name,
//       slug: p.slug,
//       price: (p.variants[0].price ?? 0).toString(),
//       image: p.variants[0].images[0] ?? null,
//     })),
//   };
// }


export const serializeProduct = (
  product: ProductPageData
): ProductPageSerialized => {
  return {
    ...product,
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant) => ({
      ...variant,
      updatedAt: variant.updatedAt.toISOString(),
      price: decimalToNumber(variant.price),
      originalPrice: decimalToNumber(variant.originalPrice),
      images: (variant.images ?? []).map((img: any) => img.image ?? img),
    })),
  };
};

export const serializeWishlistItem = (
  item: WishlistItemWithRelations
): ProductCardDTO | null => {
  const { product, variant } = item;

  if (!variant) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    storeSlug: product.admin.storeSlug,
    variant: {
      id: variant.id,
      price: decimalToNumber(variant.price),
      originalPrice: decimalToNumber(variant.originalPrice),
      image: variant.images[0]?.image ?? null,
      options: variant.options.map((opt) => ({
        key: opt.key,
        value: opt.value,
      })),
    },
    isLiked: true,
  };
};

export function mapProductWithVariantToCard(
  data: ProductCardData
): ProductCardDTO | null {
  const variant = data.variants[0];

  if (!variant) {
    return null;
  }

  return {
    id: data.id,

    name: data.name,
    slug: data.slug,

    storeSlug:
      data.admin.storeSlug,

    variant: {
      id: variant.id,

      price:
        decimalToNumber(
          variant.price
        ),

      originalPrice:
        decimalToNumber(
          variant.originalPrice
        ),

      image:
        variant.images[0]?.image ??
        null,

      options: variant.options ?
        variant.options.map(
          (option) => ({
            key: option.key,
            value: option.value,
          })
        ) : [],
    },
  };
}

export const mapCategoryToCard = (
  data: CategoryCardData
): CategoryCardDTO => {
  return {
    id: data.id,

    name: data.name,

    slug: data.slug,

    storeSlug: data.admin.storeSlug,

    image:
      data.image ??
      data.products[0]?.variants[0]?.images[0]?.image ??
      null,
  };
};

export const flattenCategories = (
  cats: any[],
  level = 0,
): { id: number; label: string; isLeaf: boolean }[] => {
  return cats.flatMap((cat) => {
    const hasChildren = cat.children && cat.children.length > 0;

    return [
      {
        id: cat.id,
        label: `${"— ".repeat(level)}${cat.name}`,
        isLeaf: !hasChildren,
      },

      ...flattenCategories(cat.children || [], level + 1),
    ];
  });
};