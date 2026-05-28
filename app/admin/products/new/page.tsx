import { getFlatCategories } from "@/app/_lib/db/queries/category.query";
import NewProduct from "../_comp/NewProduct";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";

const fetchCategoryOptions = async (
  adminId: string,
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag(`new-product-${adminId}`);

  return getFlatCategories(adminId);
};

const CreateProductPage = async () => {
  const session = await getAuthenticatedAdmin();
  if (!session || session.role !== "admin") {
    redirect("/auth");
  }

  const categories = await fetchCategoryOptions(session.id);

  return <NewProduct categories={categories} />;
};

export default CreateProductPage;

