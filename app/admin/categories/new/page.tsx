import NewCategory from "../_comp/NewCategory";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { getFlatCategories } from "@/app/_lib/db/queries/category.query";
import { cacheLife, cacheTag } from "next/cache";

const fetchCategoryOptions = async (
  adminId: string,
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag(`new-category-${adminId}`);
  return getFlatCategories(adminId);
};


const CreateCategoryPage = async () => {
  const session = await getAuthenticatedAdmin();
  if (!session || session.role !== "admin") {
    redirect("/auth");
  }

  const categories = await fetchCategoryOptions(session.id);
  if (typeof categories === "string") {
    console.error("Failed to load categories: " + categories);
    return (
      <div>
        Failed to load categories
      </div>
    );
  }
  return <NewCategory categories={categories} />;
};

export default CreateCategoryPage;