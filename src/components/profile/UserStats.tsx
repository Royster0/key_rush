"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserStatsProps {
  userId: string;
}

interface Stats {
  totalTests: number;
  averageWpm: number;
  averageAccuracy: number;
  testsToday: number;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/profile/stats?userId=${userId}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading stats...</CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Tests</p>
          <p className="text-2xl font-bold">{stats.totalTests}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Tests Today</p>
          <p className="text-2xl font-bold">{stats.testsToday}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Average WPM</p>
          <p className="text-2xl font-bold">{stats.averageWpm.toFixed(1)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Average Accuracy</p>
          <p className="text-2xl font-bold">
            {stats.averageAccuracy.toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
