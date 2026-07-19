import "dotenv/config";

import prisma from "@/lib/prisma";
import { indexAllProducts } from "@/lib/search/indexer";

async function main() {
  await indexAllProducts();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
