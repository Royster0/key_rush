import { NextResponse } from "next/server";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const cookieStore = await cookies();

  try {
    const { email, password, action } = await req.json();
    console.log("Auth request:", { email, action });

    if (action === "login") {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log("User not found");
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const valid = await compare(password, user.password);
      if (!valid) {
        console.log("Invalid password");
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      // Set the cookie
      cookieStore.set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, redirectTo: "/" });
    }

    if (action === "register") {
      const exists = await prisma.user.findUnique({
        where: { email },
      });

      if (exists) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      // Set the cookie
      cookieStore.set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, redirectTo: "/" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
