import CategoryInfiniteGrid from "./CategoryInfiniteGrid";
import { loadMoreStoreCategoryAction } from "./storeCategory.action";

const StoreCategoriesSection = async ({
  storeSlug,
  slugs,
}: { storeSlug: string, slugs?: string[] }) => {

  const initialCategories = await loadMoreStoreCategoryAction({
    storeSlug,
    slugs,
  });
  if (!initialCategories.items || initialCategories.items.length == 0) return null;
  return (
    <CategoryInfiniteGrid
      initials={initialCategories}
      storeSlug={storeSlug}
      slugs={slugs}
    />
  );
};

export default StoreCategoriesSection;
