"use server";
import { sendOtpEmail, verifyOtpCode } from "@biswajitaich/email-auth";
import { tryIt } from "../_lib/custom";
import prisma from "@/lib/prisma";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ---------------------------------------------------------------------------------------------------
// sendOtpAction.ts - sending OTP to users provided email
export async function sendOtpAction(email: string, isAdmin: string = "false") {
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      message: "Please enter a valid Gmail address",
    };
  }

  try {
    const check = await checkEmailExists(email, isAdmin);
    if (check.success) {
      return {
        success: false,
        message: `${email} is already used to signup.\n Try loggin!`,
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
// verifyOtpAction.ts - verifying OTP
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
): Promise<{ success: boolean }> {
  const [error, result] = await tryIt(async () => {
    if (isAdmin === "true") {
      return prisma.admin.findUnique({ where: { email } });
    }
    return prisma.user.findUnique({ where: { email } });
  });
  if (error) {
    console.error("Error checking email:", error);
    return { success: false };
  }
  return { success: !!result };
}
