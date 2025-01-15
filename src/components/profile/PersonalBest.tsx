"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PersonalBestsProps {
  userId: string;
}

interface PersonalBest {
  testDuration: number;
  wpm: number;
  accuracy: number;
  completedAt: string;
}

export default function PersonalBests({ userId }: PersonalBestsProps) {
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBests() {
      try {
        const res = await fetch(`/api/profile/personal-bests?userId=${userId}`);
        const data = await res.json();
        setBests(data);
      } catch (error) {
        console.error("Failed to fetch personal bests:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBests();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading personal bests...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Bests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bests.map((best) => (
            <div
              key={best.testDuration}
              className="flex justify-between items-center p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium">{best.testDuration}s Test</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(best.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{best.wpm} WPM</p>
                <p className="text-sm text-muted-foreground">
                  {best.accuracy.toFixed(1)}% ACC
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
