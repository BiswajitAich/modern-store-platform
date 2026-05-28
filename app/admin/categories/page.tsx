import CategoriesList from "./_comp/CategoriesList";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { categoryAdminListQuery } from "@/app/_lib/db/queries/category.query";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";

const CategoriesListPage = async () => {
  const session = await getAuthenticatedAdmin();
  if (session?.role !== "admin") {
    redirect("/auth");
  }
  const initialCategories = await prisma.category.findMany({
    where: { adminId: session?.id },
    ...categoryAdminListQuery,
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  // console.log(initialCategories);

  return <CategoriesList categories={initialCategories} />;
};
export default CategoriesListPage;
