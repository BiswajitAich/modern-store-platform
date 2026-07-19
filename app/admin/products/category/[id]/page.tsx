import prisma from "@/lib/prisma";
import AvailableProducts from "../../_comp/AvailableProducts";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { cacheTag, cacheLife } from "next/cache";
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";
import SectionError from "@/app/_components/loaders/SectionError";

const getAvailableProductsForCategory = async (
  categoryId: string,
  adminId: string
) => {
  "use cache";
  cacheLife("minutes");
  cacheTag(`admin-category-products-${adminId}-${categoryId}`);

  try {
    return await prisma.product.findMany({
      where: {
        categoryId: Number(categoryId),
        adminId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        brand: true,

        _count: {
          select: {
            variants: true,
            attributes: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    // console.error(error);
    // return [];
    throw new Error("Error fetching - getAvailableProductsForCategory")
  }
};
const ViewAvailableProductsPage = async (props: PageProps<'/admin/products/category/[id]'>) => {
  const { id } = await props.params;
  const session = await getAuthenticatedAdmin();
  if (!session || session.role !== "admin") {
    redirect("/auth");
  }
  const products = await getAvailableProductsForCategory(id, session?.id);
    return (
      <ErrorBoundary fallback={<SectionError name="Available Products" />}>
        <AvailableProducts products={products} />
    </ErrorBoundary >
    )
};

export default ViewAvailableProductsPage;
