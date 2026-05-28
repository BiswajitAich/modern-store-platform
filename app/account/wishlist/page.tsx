import WishListCards from "@/app/account/wishlist/_comp/WishListCards";
import type { Metadata } from "next";
import {
  getAuthenticatedUser,
  isAuthenticatedUser,
} from "@/app/_lib/customForServerSide";
import { cache } from "react";
import { tryIt } from "@/app/_lib/custom";
import prisma from "@/lib/prisma";
import { wishlistItemQuery } from "@/app/_lib/db/queries/product.query";
import { serializeWishlistItem } from "@/app/_lib/serializer";

const getWishlistPageData = cache(async (userId: string) => {
  const [err, data] = await tryIt(async () => {
    const data = await prisma.wishlistItem.findMany({
      where: { userId },
      ...wishlistItemQuery,
      take: 20,
    });
    return data
      .map(serializeWishlistItem)
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
  );

  if (err) {
    console.error("Error fetching wishlist data:", err);
    return [];
  }

  return data ?? [];
});

const WishListPage = async () => {
  if (!(await isAuthenticatedUser())) {
    return (
      <div
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: 500,
        }}
      >
        Please log in to view your wishlist.
      </div>
    );
  }

  const user = await getAuthenticatedUser();
  const wishlist = await getWishlistPageData(user.id);

  if (!wishlist.length) return <EmptyWishList />;

  return (
    <div style={{ minHeight: "90vh" }}>
      <h1 className="heading">My WishList</h1>
      <div className="underline" />
      <WishListCards wishlist={wishlist} />
    </div>
  );
};

export default WishListPage;

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

const EmptyWishList = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "var(--spacing-sm)",
      padding: "var(--spacing-lg)",
    }}
  >
    <h2 style={{ fontSize: "var(--spacing-md)", fontWeight: 700 }}>
      Your wishlist is empty
    </h2>
    <p style={{ color: "#666", maxWidth: "400px", lineHeight: 1.5 }}>
      Save products you like to your wishlist and access them anytime.
    </p>
  </div>
);