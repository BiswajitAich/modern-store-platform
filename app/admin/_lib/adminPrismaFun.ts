import { tryIt } from "@/app/_lib/custom";
import { fetchProductsforOptions } from "./adminDbCallAcrion";
import { cacheLife, cacheTag } from "next/cache";

export interface ProductsforOptions {
    id: number;
    name: string;
}

export const getProductsforOptions = async (
    adminId: string,
): Promise<ProductsforOptions[] | string> => {
    "use cache";
    cacheLife("minutes");
    cacheTag(`getProductsforOptions-${adminId}`);

    const [err, products] = await tryIt<ProductsforOptions[]>(async () => {
        return await fetchProductsforOptions(adminId);
    });

    if (err) {
        if (typeof err === "object" && err !== null && "name" in err) {
            if (
                (err as { name: string }).name === "PrismaClientInitializationError"
            ) {
                return "Database is unreachable.";
            }

            if ((err as { name: string }).name === "PrismaClientKnownRequestError") {
                return "Database query failed.";
            }
        }
        return "Unexpected server error.";
    }
    return products as ProductsforOptions[];
};
