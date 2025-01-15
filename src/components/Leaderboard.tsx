"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  completedAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

const TIME_PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "allTime", label: "All Time" },
];

const TEST_DURATIONS = [5, 15, 30, 60, 120];

export default function Leaderboard() {
  const [period, setPeriod] = useState("daily");
  const [duration, setDuration] = useState("30");
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard?period=${period}&duration=${duration}`
        );
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [period, duration]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIODS.map((tp) => (
              <SelectItem key={tp.value} value={tp.value}>
                {tp.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {TEST_DURATIONS.map((td) => (
              <SelectItem key={td} value={td.toString()}>
                {td} seconds
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">No results found</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 font-semibold pb-2 border-b">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">User</div>
              <div className="col-span-2 text-right">WPM</div>
              <div className="col-span-2 text-right">Raw WPM</div>
              <div className="col-span-2 text-right">Accuracy</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
            {results.map((result, index) => (
              <div
                key={result.id}
                className="grid grid-cols-12 gap-4 items-center"
              >
                <div className="col-span-1 font-semibold">{index + 1}</div>
                <div className="col-span-4">
                  {result.user.name || result.user.email}
                </div>
                <div className="col-span-2 text-right">{result.wpm}</div>
                <div className="col-span-2 text-right">{result.rawWpm}</div>
                <div className="col-span-2 text-right">
                  {result.accuracy.toFixed(1)}%
                </div>
                <div className="col-span-1 text-right text-sm text-gray-500">
                  {new Date(result.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
