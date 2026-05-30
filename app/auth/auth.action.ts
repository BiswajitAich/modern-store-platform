"use server";
import { sendOtpEmail, verifyOtpCode } from "@biswajitaich/email-auth";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ---------------------------------------------------------------------------------------------------
// sending OTP to users provided email
export async function sendOtpAction(
  email: string,
  isAdmin: string = "false",
  purpose: "signup" | "reset-password" = "signup"
) {
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: "Please enter a valid Gmail address",
    };
  }

  try {
    const exists = await checkEmailExists(email, isAdmin);
    if (purpose === "signup" && exists) {
      return {
        success: false,
        message: "Email already registered. Try logging in.",
      };
    }

    if (purpose === "reset-password" && !exists) {
      return {
        success: false,
        message: "No account found with this email.",
      };
    }

    const result = await sendOtpEmail(email, "commyfy.com");
    if (result.success) {
      return {
        success: true,
        message: "OTP sent to your email address",
      };
    } else {
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      };
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return {
      success: false,
      message: "An error occurred while sending OTP",
    };
  }
}

// ---------------------------------------------------------------------------------------------------
// verifying OTP
export async function verifyOtpAction(email: string, otp: string) {
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      verified: false,
      message: "Invalid email address",
    };
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    return {
      success: false,
      verified: false,
      message: "Please enter a valid 6-digit OTP",
    };
  }

  try {
    const result = await verifyOtpCode(email, otp);

    if (result.success) {
      return {
        success: true,
        verified: true,
        message: "Email verified successfully!",
      };
    } else {
      return {
        success: false,
        verified: false,
        message: "Invalid or expired OTP. Please try again.",
      };
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      verified: false,
      message: "An error occurred while verifying OTP",
    };
  }
}

async function checkEmailExists(
  email: string,
  isAdmin: string
): Promise<boolean> {
  const user =
    isAdmin === "true"
      ? await prisma.admin.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { email } });

  return !!user;
}

// ---------------------------------------------------------------------------------------------------
// reset Password
export async function resetPasswordAction({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const exists = await checkEmailExists(email, "false");

    if (!exists) {
      return { message: "Email not found SignUp to join us!", success: false };
    }

    const passwordHash = await hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return { message: "Password reset successful", success: true };
  } catch (error) {
    console.error("Error resetting password:", (error as Error).message);
    return { success: false };
  }
}