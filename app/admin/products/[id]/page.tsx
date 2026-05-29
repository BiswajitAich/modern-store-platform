import prisma from "@/lib/prisma";
import NotFound from "../../not-found";
import ProductAttributesAndVariants from "../_comp/ProductAttributesAndVariants";
import { Suspense } from "react";
import Loading from "@/app/loading";

export default async function ProductVariantsPage(props: PageProps<'/admin/products/[id]'>) {
  const { id } = await props.params;

  const productRaw = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      brand: true,
      isActive: true,
      variants: {
        include: { options: true, images: true },
      },
      attributes: true,
    },
  });
  console.log(productRaw);

  if (!productRaw) {
    return <NotFound message="Product not found" path="/admin/products" />;
  }
  const product = {
    ...productRaw,
    variants: productRaw.variants.map((variant) => ({
      ...variant,
      price: variant.price.toNumber(),
      originalPrice: variant.originalPrice?.toNumber() ?? null,
      costPrice: variant.costPrice?.toNumber() ?? null,
      images: variant.images,
    })),
  };

  return (
    <Suspense fallback={<Loading />}>
      <ProductAttributesAndVariants product={product} id={id} />;
    </Suspense>
  )
}
