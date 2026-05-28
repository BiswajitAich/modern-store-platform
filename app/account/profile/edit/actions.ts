"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import { redirect } from "next/navigation";
import { z } from "zod";
import cloudinary from "@/app/_lib/cloudinary";

export async function updateProfileAction(
  _prevState: ErrorFormState | undefined,
  form: FormData
): Promise<ErrorFormState> {
  const [error] = await tryIt(async () => {
    /* ---------------------------------- */
    /* Auth Guard                         */
    /* ---------------------------------- */
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "user") {
      throw new Error("Unauthorized request");
    }

    /* ---------------------------------- */
    /* Extract & Sanitize Form Data       */
    /* ---------------------------------- */
    const firstName = form.get("firstName")?.toString().trim();
    const lastName = form.get("lastName")?.toString().trim();
    const phoneNumber = form.get("phoneNumber")?.toString().trim() || null;
    const profileImageEntry = form.get("profileImage");
    const profileImage =
      profileImageEntry instanceof File &&
      profileImageEntry.size > 0 &&
      profileImageEntry.type.startsWith("image/")
        ? profileImageEntry
        : undefined;
    const imageFileChanged = form.get("imageFileChanged") === "true";
    const previousImageId = form.get("previousImageId")?.toString() || null;

    /* ---------------------------------- */
    /* Validation                         */
    /* ---------------------------------- */

    const parsed = updateProfileSchema.safeParse({
      firstName,
      lastName,
      phoneNumber,
      profileImage: imageFileChanged ? profileImage : undefined,
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    console.log("data parsed !");

    /* ---------------------------------- */
    /* Image Handling (Reference only)    */
    /* ---------------------------------- */
    let imagePublicId: string | null = null;

    if (imageFileChanged  && profileImage instanceof File) {
      if (previousImageId) {
        const destroyed = await cloudinary.uploader.destroy(previousImageId);
        if (destroyed.result !== "ok" && destroyed.result !== "not found") {
          throw new Error("Previous image deletion failed");
        }
      }
      console.log("image destyoyed !");

      imagePublicId = await new Promise<string>((res, rej) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "commyfy/profile-image" },
          (err, result) => (err ? rej(err) : res(result!.public_id))
        );
        profileImage.arrayBuffer().then((b) => stream.end(Buffer.from(b)));
      });
      console.log("image uploaded !");
    }
    if (imageFileChanged && profileImage && !imagePublicId) {
      throw new Error("Image upload failed");
    }

    /* ---------------------------------- */
    /* Database Update                    */
    /* ---------------------------------- */
    await prisma.user.update({
      where: { userId: session.user.id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        ...(imagePublicId && { profileImage: imagePublicId }),
      },
    });
    console.log("database updated !");
  });

  /* ---------------------------------- */
  /* Error Handling                     */
  /* ---------------------------------- */
  if (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.",
      timestamp: new Date().toISOString(),
    };
  }

  revalidatePath("/account/profile");
  redirect("/account/profile");
}

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),

  lastName: z.string().min(1, "Last name is required").max(50),

  phoneNumber: z
    .string()
    .regex(/^[0-9]{8,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),

  profileImage: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 1 * 1024 * 1024,
      "Image must be under 1 MB"
    ),
});
