import { Prisma } from "@/app/generated/prisma/client";

export const productSearchSelect = {
    id: true,
    adminId: true,

    name: true,
    description: true,
    brand: true,

    category: {
        select: {
            name: true,
            description: true,
        },
    },

    attributes: {
        select: {
            key: true,
            value: true,
        },
    },

    variants: {
        select: {
            sku: true,
            price: true,
            options: {
                select: {
                    key: true,
                    value: true,
                },
            },
        },
    },
} satisfies Prisma.ProductSelect;
type ProductSearchSelect = Prisma.ProductGetPayload<{
    select: typeof productSearchSelect;
}>;

export function buildSearchDocument(product: ProductSearchSelect): string {
  const parts: string[] = [];

  parts.push(`Product: ${product.name}`);

  if (product.description) {
    parts.push(`Description: ${product.description}`);
  }

  if (product.brand) {
    parts.push(`Brand: ${product.brand}`);
  }

  if (product.category) {
    parts.push(
      `Category: ${product.category.name}${
        product.category.description
          ? `- ${product.category.description}`
          : ""
      }`
    );
  }

  if (product.attributes.length > 0) {
    parts.push(
      "Attributes: " +
        product.attributes
          .map((a) => `${a.key}: ${a.value}`)
          .join(", ")
    );
  }

  if (product.variants.length > 0) {
    parts.push(
      "Variants:\n" +
        product.variants
          .map((v) => {
            const options = v.options
              .map((o) => `${o.key}: ${o.value}`)
              .join(", ");

            return `• Price: ${v.price}, ${options}`;
          })
          .join("\n")
    );
  }

  return parts.join("\n\n");
}
