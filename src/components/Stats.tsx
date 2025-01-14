import { memo } from "react";
import { StatsDisplayProps } from "@/lib/types";

const Stats = memo(({ timeLeft, wpm, rawWpm, accuracy }: StatsDisplayProps) => (
    <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">{rawWpm}</div>
            <div className="text-sm text-gray-500">{accuracy}</div>
        </div>
        <span className="text-xl font-bold">{timeLeft}s</span>
        <span className="text-2xl font-bold">{wpm} WPM</span>
    </div>
));

Stats.displayName = "Stats";
export default Stats;