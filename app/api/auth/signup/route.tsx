import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    // If isAdmin === "true" → create in Admin table else in User table
    await prisma.user.create({
      data: {
        email,
        firstName: firstname,
        lastName: lastname,
        passwordHash: hash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { success: false, message: "Error creating account" },
      { status: 500 }
    );
  }
}
