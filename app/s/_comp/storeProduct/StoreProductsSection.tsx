import ProductInfiniteGrid from "./ProductInfiniteGrid";
import { loadMoreStoreProductsAction } from "./storeProduct.action";

const StoreProductsSection = async ({
    storeSlug,
    slugs,
}: {
    storeSlug: string;
    slugs?: string[];
}) => {
    const initialProducts = await loadMoreStoreProductsAction({
        storeSlug,
        slugs,
    });

    return (
        <ProductInfiniteGrid
            initials={initialProducts}
            storeSlug={storeSlug}
            slugs={slugs}
        />
    );
};

export default StoreProductsSection;
