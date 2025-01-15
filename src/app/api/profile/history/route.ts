import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
  const prisma = new PrismaClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const duration = searchParams.get("duration");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const history = await prisma.testResult.findMany({
      where: {
        userId,
        ...(duration !== "all" && {
          testDuration: parseInt(duration!),
        }),
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
