import styles from "./PUI.module.css";
import { getAuthenticatedUser, isAuthenticatedUser } from "@/app/_lib/customForServerSide";
import VariantSection from "./varient/VariantSection";
import dynamic from "next/dynamic";
import Price from "@/app/_components/price/Price";
import DescRating from "@/app/_components/desc_rating/DescRating";
import { getWishlistItems } from "@/app/_lib/prismaFun";
import KeyFeatures from "@/app/_components/keyFeatures/KeyFeatures";
import { generateVariantHash, normalizeSearchParams } from "../utility";
import { ProductPageSerialized } from "@/app/_lib/db/types/product.types";
import ImageGallary from "./ImageGallary";

const PUIClient = dynamic(() => import("./PUIClient"));

const Reviews = dynamic(() => import("@/app/_components/reviews/Reviews"));

const PUIServer = async ({
  productData,
  slug,
  storeSlug,
  searchParams,
}: {
  productData: ProductPageSerialized;
  slug: string;
  storeSlug: string;
  searchParams: Record<
    string,
    string | string[] | undefined
  >;
}) => {
  const optionHash = generateVariantHash(searchParams);
  const selectedVariant = (() => {
    if (!optionHash) return productData.variants[0];

    const byHash = productData.variants.find(v => v.optionHash === optionHash);
    if (byHash) return byHash;

    const normalized = normalizeSearchParams(searchParams);
    return (
      productData.variants.find(
        (variant) =>
          variant.options.length === Object.keys(normalized).length &&
          variant.options.every(
            (opt) =>
              normalized[opt.key]?.toLowerCase() ===
              opt.value.toLowerCase(),
          ),
      ) ?? null
    );
  })();


  let paramsToReplaceForDefault: string | undefined = undefined;
  if (!optionHash && selectedVariant) {
    const params = new URLSearchParams();
    selectedVariant.options.forEach((opt) => params.set(opt.key, opt.value));
    const paramStr = params.toString();
    if (paramStr) paramsToReplaceForDefault = paramStr;
  }

  const images = selectedVariant?.images || [];
  const imageIndex =
    typeof searchParams.image === "string" ? parseInt(searchParams.image) : 0;
  const selectedImage = images[imageIndex] ?? images[0];

  const wishlistItems = (await isAuthenticatedUser())
    ? await getWishlistItems(
      Number(productData.id),
      (await getAuthenticatedUser()).id,
    )
    : null;
  const isLiked = wishlistItems
    ? !!wishlistItems.find((w) => w.variantId === selectedVariant?.id)
    : false;

  const optionsMap: Record<string, string[]> = {};
  productData.variants.forEach((variant) => {
    variant.options.forEach((opt) => {
      if (!optionsMap[opt.key]) optionsMap[opt.key] = [];
      if (!optionsMap[opt.key].includes(opt.value)) {
        optionsMap[opt.key].push(opt.value);
      }
    });
  });

  const selectedOptions: Record<string, string> = {};
  selectedVariant?.options.forEach((opt) => {
    selectedOptions[opt.key] = opt.value;
  });

  const flatSearchParams = Object.fromEntries(
    Object.entries(searchParams).flatMap(([k, v]) =>
      typeof v === "string" ? [[k, v]] : [],
    ),
  );

  return (
    <main className={styles.container}>
      <div className={styles.productLayout}>
        {/* Image Gallery Section */}
        <ImageGallary 
        images={images} 
        flatSearchParams={flatSearchParams}
        isLiked={isLiked}
        title={productData.name}
        imageIndex={imageIndex}
        selectedImage={selectedImage}
        selectedVariant={selectedVariant}
        productId={productData.id}
        />

        {/* Product Details Section */}
        <div className={styles.detailsSection}>
          <DescRating productData={productData} />

          {selectedVariant &&
            selectedVariant.price !== null &&
            selectedVariant.originalPrice !== null && (
              <Price
                price={selectedVariant.price}
                originalPrice={selectedVariant.originalPrice}
              />
            )}

          {productData.variants.length > 0 && (
            <VariantSection
              storeSlug={storeSlug}
              slug={slug}
              productData={productData}
              selectedVariant={selectedVariant}
              optionsMap={optionsMap}
              selectedOptions={selectedOptions}
            />
          )}

          <KeyFeatures />

          <PUIClient
            paramsToReplaceForDefault={paramsToReplaceForDefault}
            productData={productData}
            selectedVariant={selectedVariant}
            isAuthenticated={await isAuthenticatedUser()}
          >
            <Reviews productId={productData.id} count={productData._count.reviews} />
          </PUIClient>
        </div>
      </div>
    </main>
  );
};

export default PUIServer;