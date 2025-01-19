import { RefObject, useCallback } from "react";

export const useTextMeasurement = (
  containerRef: RefObject<HTMLDivElement | null>
) => {
  return useCallback(
    (text: string): string[] => {
      if (!containerRef.current) return [];

      const container = containerRef.current;
      const temp = document.createElement("div");
      Object.assign(temp.style, {
        visibility: "hidden",
        position: "absolute",
        whiteSpace: "pre",
        fontSize: "1.5rem",
        fontFamily: "monospace",
      });

      container.appendChild(temp);
      const maxWidth = container.clientWidth - 48;

      const lines: string[] = [];
      let currentLine = "";
      text.split(" ").forEach((word) => {
        temp.textContent = currentLine + (currentLine ? " " : "") + word;
        if (temp.offsetWidth <= maxWidth) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            lines.push(word);
            currentLine = "";
          }
        }
      });

      if (currentLine) lines.push(currentLine);
      container.removeChild(temp);

      return lines;
    },
    [containerRef]
  );
};

export const useTypingStats = (
  startTime: number | null,
  totalKeystrokes: number,
  correctKeystrokes: number
) => {
  return useCallback(() => {
    if (!startTime) return { wpm: 0, rawWpm: 0, accuracy: 100 };

    const elapsedTime = (Date.now() - startTime) / 1000 / 60;

    // calculate raw wpm
    const rawTyped = totalKeystrokes / 5;
    const calculatedRaw = Math.round(rawTyped / elapsedTime);

    // calculate accuracy
    const calculatedAcc =
      totalKeystrokes > 0
        ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
        : 100;

    // calculate actual wpm
    const calculatedWpm = Math.round(correctKeystrokes / (5 * elapsedTime));

    return {
      wpm: calculatedWpm,
      rawWpm: calculatedRaw,
      accuracy: calculatedAcc,
    };
  }, [startTime, totalKeystrokes, correctKeystrokes]);
};
