import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { startOfDay, startOfWeek } from "date-fns";

interface RawTestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  completedAt: Date;
  userId: string;
  testDuration: number;
  mistakeCount: number;
  characterCount: number;
  rank: number;
  email: string;
  name: string | null;
}

interface FormattedTestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  completedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

export async function GET(request: Request) {
  const prisma = new PrismaClient();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "daily";
  const duration = parseInt(searchParams.get("duration") || "30");

  let dateFilter = {};

  switch (period) {
    case "daily":
      dateFilter = {
        completedAt: {
          gte: startOfDay(new Date()),
        },
      };
      break;
    case "weekly":
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dateFilter = {
        completedAt: {
          gte: startOfWeek(new Date()),
        },
      };
      break;
  }

  try {
    const results = await prisma.$queryRaw<RawTestResult[]>`
      WITH RankedScores AS (
        SELECT 
          tr.*,
          ROW_NUMBER() OVER (
            PARTITION BY tr."userId"
            ORDER BY tr.wpm DESC, tr.accuracy DESC
          ) as rank
        FROM "TestResult" tr
        WHERE 
          tr."testDuration" = ${duration}
          ${
            period === "daily"
              ? Prisma.sql`AND tr."completedAt" >= ${startOfDay(new Date())}`
              : period === "weekly"
              ? Prisma.sql`AND tr."completedAt" >= ${startOfWeek(new Date())}`
              : Prisma.sql``
          }
      )
      SELECT 
        rs.*,
        u.email,
        u.name
      FROM RankedScores rs
      JOIN "User" u ON rs."userId" = u.id
      WHERE rs.rank = 1
      ORDER BY rs.wpm DESC, rs.accuracy DESC
      LIMIT 100
    `;

    const formattedResults: FormattedTestResult[] = results.map((result) => ({
      id: result.id,
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      completedAt: result.completedAt,
      user: {
        name: result.name,
        email: result.email,
      },
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
