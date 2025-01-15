import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { auth } from "@/lib/auth";
import { startOfDay, startOfWeek } from "date-fns";

export async function POST(req: Request) {
  const user = await auth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wpm, rawWpm, accuracy, testDuration, mistakeCount, characterCount } =
    await req.json();

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

  // Invalidate cached leaderboards
  await prisma.leaderboardCache.deleteMany({
    where: {
      duration: testDuration,
    },
  });

  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");
  const duration = parseInt(searchParams.get("duration") || "30");

  // Try to get cached leaderboard
  const cached = await prisma.leaderboardCache.findUnique({
    where: {
      period_duration: {
        period: period || "daily",
        duration,
      },
    },
  });

  if (cached && cached.updatedAt > new Date(Date.now() - 1000 * 60 * 5)) {
    // 5 minute cache
    return NextResponse.json(cached.data);
  }

  let dateFilter = {};
  if (period === "daily") {
    dateFilter = {
      completedAt: {
        gte: startOfDay(new Date()),
      },
    };
  } else if (period === "weekly") {
    dateFilter = {
      completedAt: {
        gte: startOfWeek(new Date()),
      },
    };
  }

  const results = await prisma.testResult.findMany({
    where: {
      testDuration: duration,
      ...dateFilter,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      wpm: "desc",
    },
    take: 100,
  });

  // Cache the results
  await prisma.leaderboardCache.upsert({
    where: {
      period_duration: {
        period: period || "daily",
        duration,
      },
    },
    create: {
      period: period || "daily",
      duration,
      data: results,
    },
    update: {
      data: results,
    },
  });

  return NextResponse.json(results);
}
