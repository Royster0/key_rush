import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfDay } from "date-fns";

export async function GET(request: Request) {
  const prisma = new PrismaClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const [totalTests, averages, testsToday] = await Promise.all([
      // Get total tests
      prisma.testResult.count({
        where: { userId },
      }),
      // Get averages
      prisma.testResult.aggregate({
        where: { userId },
        _avg: {
          wpm: true,
          accuracy: true,
        },
      }),
      // Get tests today
      prisma.testResult.count({
        where: {
          userId,
          completedAt: {
            gte: startOfDay(new Date()),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalTests,
      averageWpm: averages._avg.wpm || 0,
      averageAccuracy: averages._avg.accuracy || 0,
      testsToday,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
