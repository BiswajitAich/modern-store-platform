import prisma from "@/lib/prisma";
import HeroList from "./_comp/HeroList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const HeroPage = async () => {
  // "use cache";
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    redirect("/");
  }
  const heroData = await prisma.heroBanner.findMany({
    where: { adminId: session.user.id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      image: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
    },
  });
  return <HeroList heroData={heroData} />;
};

export default HeroPage;
