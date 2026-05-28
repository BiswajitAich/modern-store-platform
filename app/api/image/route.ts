import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { tryIt } from "@/app/_lib/custom";

export async function GET(req: NextRequest) {
  const rawImageId = req.nextUrl.searchParams.get("imageId");
  const placeholderPath = path.join(process.cwd(), "public/placeholder.png");
  const fallback = fs.readFileSync(placeholderPath);

  if (!rawImageId) {
    return new NextResponse(fallback, {
      headers: { "Content-Type": "image/png" },
    });
  }

  const imageId = decodeURIComponent(rawImageId);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${imageId}`;
  const [error, response] = await tryIt(async () => {
    const response = await fetch(cloudUrl);

    if (!response.ok) {
      console.error("Cloudinary error:", response.status);
      throw new Error("Failed to fetch image from Cloudinary");
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
  });

  if (error || !response) {
    return new NextResponse(fallback, {
      headers: { "Content-Type": "image/png" },
    });
  }

  return new NextResponse(response?.buffer, {
    headers: {
      "Content-Type": response?.contentType || "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
