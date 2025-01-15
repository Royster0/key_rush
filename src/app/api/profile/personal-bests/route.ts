import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

interface TestResult {
  id: string;
  testDuration: number;
  wpm: number;
  accuracy: number;
  completedAt: Date;
  rank: number;
}

export async function GET(request: Request) {
  const prisma = new PrismaClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const personalBests = await prisma.$queryRaw<TestResult[]>`
      WITH RankedResults AS (
        SELECT 
          id,
          "testDuration",
          wpm,
          accuracy,
          "completedAt",
          ROW_NUMBER() OVER (
            PARTITION BY "testDuration"
            ORDER BY wpm DESC, accuracy DESC
          ) as rank
        FROM "TestResult"
        WHERE "userId" = ${userId}
      )
      SELECT * FROM RankedResults
      WHERE rank = 1
      ORDER BY "testDuration"
    `;

    const formattedBests = personalBests.map((best) => ({
      id: best.id,
      testDuration: Number(best.testDuration),
      wpm: Number(best.wpm),
      accuracy: Number(best.accuracy),
      completedAt: best.completedAt.toISOString(),
      rank: Number(best.rank),
    }));

    return NextResponse.json(formattedBests);
  } catch (error) {
    console.error("Failed to fetch personal bests:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal bests" },
      { status: 500 }
    );
  }
}
