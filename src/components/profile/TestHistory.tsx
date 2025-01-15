"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestHistoryProps {
  userId: string;
}

interface TestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  testDuration: number;
  completedAt: string;
}

export default function TestHistory({ userId }: TestHistoryProps) {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("all");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(
          `/api/profile/history?userId=${userId}&duration=${duration}`
        );
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId, duration]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading history...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Test History</CardTitle>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="5">5s Tests</SelectItem>
              <SelectItem value="15">15s Tests</SelectItem>
              <SelectItem value="30">30s Tests</SelectItem>
              <SelectItem value="60">60s Tests</SelectItem>
              <SelectItem value="120">120s Tests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground pb-2">
            <div>Date</div>
            <div>Duration</div>
            <div className="text-right">WPM</div>
            <div className="text-right">Raw WPM</div>
            <div className="text-right">Accuracy</div>
          </div>
          {history.map((test) => (
            <div key={test.id} className="grid grid-cols-5 gap-4 py-2 border-t">
              <div>{new Date(test.completedAt).toLocaleDateString()}</div>
              <div>{test.testDuration}s</div>
              <div className="text-right font-medium">{test.wpm}</div>
              <div className="text-right text-muted-foreground">
                {test.rawWpm}
              </div>
              <div className="text-right">{test.accuracy.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
