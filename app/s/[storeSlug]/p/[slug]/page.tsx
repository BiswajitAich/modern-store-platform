import { Metadata } from "next";
import { notFound } from "next/navigation";
import PUIServer from "../_comp/PUI.server";
import { cacheLife, cacheTag } from "next/cache";
import { fetchPageProductDataBySlug } from "@/app/_lib/db/queries/product.query";
import { ProductPageSerialized } from "@/app/_lib/db/types/product.types";
interface PageProp {
  params: Promise<{ storeSlug: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getProductBySlug = async (
  storeSlug: string,
  slug: string
): Promise<ProductPageSerialized | null> => {
  "use cache";
  cacheLife("hours");
  cacheTag(`s-${storeSlug}-p-${slug}`);

  return await fetchPageProductDataBySlug(slug, storeSlug);
};

const Productpage = async ({ params, searchParams }: PageProp) => {
  const { slug, storeSlug } = await params;

  const productData =
    await getProductBySlug(storeSlug, slug);
    console.log(productData);
    

  if (!productData) notFound();
  return (
      <PUIServer
        productData={productData}
        searchParams={await searchParams}
        slug={slug}
        storeSlug={storeSlug}
      />
  );
};

export default Productpage;

export const generateMetadata = async ({
  params,
}: PageProp): Promise<Metadata> => {
  const { slug, storeSlug } = await params;
  if (!slug || !storeSlug) return {};

  const product = await getProductBySlug(storeSlug, slug);
  if (!product) return {};

  const selectedVariant = product.variants[0];

  const ogImage = selectedVariant?.images[0]
    ? `/api/image?imageId=${selectedVariant.images[0]}`
    : "/commyfy.png";

  const variantText = selectedVariant?.options?.map((o) => o.value).join(" - ");
  const title = variantText
    ? `${product.name} (${variantText})`
    : product.name;

  const description = `${product.description ?? ""} Available in ${product.variants.length
    } variants at price starting from ${product.variants[0].price}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/s/${storeSlug}/p/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
  };
};