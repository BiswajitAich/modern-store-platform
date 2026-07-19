import "dotenv/config";
import prisma from "@/lib/prisma";

async function main() {
    console.log(process.env.DATABASE_URL);
    const count = await prisma.product.count();
    console.log(count);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
