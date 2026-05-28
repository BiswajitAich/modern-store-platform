import prisma from "@/lib/prisma";
import { Suspense } from "react";

import Loading from "@/app/loading";
import NotFound from "@/app/admin/not-found";

import { PageProps } from "@/app/_lib/types";

import EditVariantForm from "../_comp/EditVariantForm";

export default async function EditVariantPage({
  params,
}: PageProps) {
  const { id, variantId } = await params;

  const variantRaw = await prisma.productVariant.findFirst({
    where: {
      id: Number(variantId),
      productId: Number(id),
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          isActive: true,
        },
      },

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
  });

  if (!variantRaw) {
    return (
      <NotFound
        message="Variant not found"
        path={`/admin/products/${id}/edit`}
      />
    );
  }

  const variant = {
    ...variantRaw,

    price: Number(variantRaw.price),

    originalPrice:
      variantRaw.originalPrice !== null
        ? Number(variantRaw.originalPrice)
        : null,

    costPrice:
      variantRaw.costPrice !== null
        ? Number(variantRaw.costPrice)
        : null,
  };

  return (
    <Suspense fallback={<Loading />}>
      <EditVariantForm
        productId={id}
        variant={variant}
      />
    </Suspense>
  );
}