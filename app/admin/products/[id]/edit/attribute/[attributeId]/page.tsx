import prisma from "@/lib/prisma";
import NotFound from "@/app/admin/not-found";
import EditProductAttribute from "../_comp/EditProductAttribute";

export default async function EditProductAttributePage(props: PageProps<'/admin/products/[id]/edit/attribute/[attributeId]'>) {
  const { id, attributeId } = await props.params;

  const attribute = await prisma.productAttribute.findFirst({
    where: {
      id: Number(attributeId),
      productId: Number(id),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          adminId: true,
        },
      },
    },
  });

  if (!attribute) {
    return (
      <NotFound
        message="Product attribute not found"
        path={`/admin/products/${id}`}
      />
    );
  }

  return (
    <EditProductAttribute
      attribute={{
        id: attribute.id,
        key: attribute.key,
        value: attribute.value,
        displayOrder: attribute.displayOrder,
        productId: attribute.productId,
        productName: attribute.product.name,
      }}
    />
  );
}