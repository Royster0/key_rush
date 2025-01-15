import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const prisma = new PrismaClient();

  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      wpm,
      rawWpm,
      accuracy,
      testDuration,
      mistakeCount,
      characterCount,
    } = body;

    const result = await prisma.testResult.create({
      data: {
        userId: user.id,
        wpm,
        rawWpm,
        accuracy,
        testDuration,
        mistakeCount,
        characterCount,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save test result:", error);
    return NextResponse.json(
      { error: "Failed to save test result" },
      { status: 500 }
    );
  }
}
