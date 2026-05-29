import prisma from "@/lib/prisma";
import AvailableProducts from "../../_comp/AvailableProducts";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { cacheTag, cacheLife } from "next/cache";

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
    console.error(error);
    return [];
  }
};
const ViewAvailableProductsPage = async (props: PageProps<'/admin/products/category/[id]'>) => {
  const { id } = await props.params;
  const session = await getAuthenticatedAdmin();
  if (!session || session.role !== "admin") {
    redirect("/auth");
  }
  const products = await getAvailableProductsForCategory(id, session?.id);
  return <AvailableProducts products={products} />;
};

export default ViewAvailableProductsPage;
