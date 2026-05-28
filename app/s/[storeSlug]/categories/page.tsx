import StoreCategoriesSection from "../../_comp/storeCategory/StoreCategoriesSection";

const CategoryPage = async (
    { params }: { params: Promise<{ storeSlug: string }> }
) => {
    const { storeSlug } = await params;
    return (
        <div>
            Page will be available soon
            <StoreCategoriesSection storeSlug={storeSlug} />
        </div>
    );
}

export default CategoryPage;