import { memo } from "react";
import { TimeButtonsProps } from "@/lib/types";
import { TIME_OPTIONS } from "@/lib/constants";
import { Button } from "./ui/button";

const TimeButtons = memo(({ selectedTime, onTimeSelect, isActive }: TimeButtonsProps) => (
    <div className="flex gap-2">
        {TIME_OPTIONS.map(time => (
            <Button
                key={time}
                variant={time === selectedTime ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeSelect(time)}
                disabled={isActive}
            >
                {time}s
            </Button>
        ))}
    </div>
));

TimeButtons.displayName = "TimeButtons";
export default TimeButtons;