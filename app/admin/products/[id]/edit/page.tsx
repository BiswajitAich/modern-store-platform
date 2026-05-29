import prisma from "@/lib/prisma";
import NotFound from "../../../not-found";
import { Suspense } from "react";
import Loading from "@/app/loading";
import EditProductVariants from "./variant/_comp/EditProductVariants";

export default async function EditProductVariantsPage({
  params,
}: PageProps<'/admin/products/[id]/edit'>) {
  const { id } = await params;

  const productRaw = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      name: true,
      brand: true,
      isActive: true,

      variants: {
        orderBy: {
          displayOrder: "asc",
        },
        include: {
          options: {
            orderBy: {
              id: "asc",
            },
          },

          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },

      attributes: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!productRaw) {
    return (
      <NotFound
        message="Product not found"
        path="/admin/products"
      />
    );
  }

  const product = {
    ...productRaw,

    variants: productRaw.variants.map((variant) => ({
      ...variant,

      price: Number(variant.price),

      originalPrice:
        variant.originalPrice !== null
          ? Number(variant.originalPrice)
          : null,

      costPrice:
        variant.costPrice !== null
          ? Number(variant.costPrice)
          : null,
    })),
  };

  return (
    <Suspense fallback={<Loading />}>
      <EditProductVariants
        product={product}
        id={id}
      />
    </Suspense>
  );
}