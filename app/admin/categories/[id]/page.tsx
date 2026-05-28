import prisma from "@/lib/prisma";
import EditCategory from "../_comp/EditCategory";
import NotFound from "../../not-found";
import { PageProps } from "@/app/_lib/types";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { cacheLife, cacheTag } from "next/cache";
import { getFlatCategories } from "@/app/_lib/db/queries/category.query";

const fetchInitialCategoryData = async (id: string, adminId: string) => {
  "use cache";
  cacheLife("seconds");
  cacheTag(`fetchInitialCategoryData-${adminId}`);
  try {
    return await prisma.category.findUnique({
      where: { id: Number(id), adminId },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        isActive: true,
        sortOrder: true,
        description: true,
        parent: {
          select: { id: true, name: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchCategoryOptions = async (
  adminId: string,
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag(`fetchCategoryOptions-${adminId}`);
  return getFlatCategories(adminId);
};

const EditCategories = async ({ params }: PageProps) => {
  const { id } = await params;
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "admin") {
    redirect("/auth");
  }
  const [initialCategory, initialCategories] = await Promise.all([
    fetchInitialCategoryData(id, admin.id),
    fetchCategoryOptions(admin.id),
  ])
  if (!initialCategory) {
    return <NotFound message="Category not found" path="/admin/categories" />;
  }
  // console.log("initialCategory", initialCategory);
  // console.log("initialCategories", initialCategories);

  return (
    <EditCategory
      category={initialCategory}
      allCategories={initialCategories}
    />
  );
};

export default EditCategories;
