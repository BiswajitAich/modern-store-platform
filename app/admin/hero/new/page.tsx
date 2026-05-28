import { redirect } from "next/navigation";
import CreateNewHero from "../_comp/CreateNewHero";
import { getProductsforOptions } from "../../_lib/adminPrismaFun";
import { getFlatCategories } from "@/app/_lib/db/queries/category.query";
import { cacheLife, cacheTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";



const fetchCategoryOptions = async (
  adminId: string,
) => {
  "use cache";
  cacheLife("seconds");
    cacheTag(`new-hero-${adminId}`);
  return getFlatCategories(adminId);
};


const CreateNewHeroPage = async () => {
  const session = await getAuthenticatedAdmin();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const [products, categories] = await Promise.all([
    getProductsforOptions(session.id),
    fetchCategoryOptions(session.id),
  ]);

  if (typeof categories === "string") {
    throw new Error("Failed to load categories: " + categories);
  }
  if (typeof products === "string") {
    throw new Error("Failed to load categories: " + categories);
  }

  return (
    <CreateNewHero products={products ?? []} categories={categories ?? []} />
  );
};

export default CreateNewHeroPage;

// export const revalidate = 60 * 10; // Revalidate every 10 minutes
