"use client";

import { useTextMeasurement, useTypingStats } from "@/lib/hooks";
import { generateText } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import Character from "./Character";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import TimeButtons from "./TimeButton";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { ModeToggle } from "./ui/mode-toggle";
import Stats from "./Stats";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "@/lib/types";

interface GameProps {
  user: User | null;
}

const Game = ({ user }: GameProps) => {
  const [selectedTime, setSelectedTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [mistakes, setMistakes] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [resultsSaved, setResultsSaved] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const measureText = useTextMeasurement(containerRef);
  const calculateStats = useTypingStats(
    startTime,
    totalKeystrokes,
    correctKeystrokes
  );

  const restart = useCallback(() => {
    const newText = generateText();
    setText(newText);
    setLines(measureText(newText));
    setTyped("");
    setStartTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIsActive(false);
    setMistakes(new Set());
    setTimeLeft(selectedTime);
    setIsFinished(false);
    setResultsSaved(false);

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
  }, [selectedTime, measureText]);

  const saveResult = useCallback(async () => {
    if (!user) {
      console.log("Guest user");
      return;
    }

    try {
      const response = await fetch("/api/typing/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wpm,
          rawWpm,
          accuracy,
          testDuration: selectedTime,
          mistakeCount: mistakes.size,
          characterCount: totalKeystrokes,
        }),
      });

      if (!response.ok) console.log("Failed to save results");
    } catch (e) {
      console.log("Error saving results: ", e);
    }
  }, [
    user,
    wpm,
    rawWpm,
    accuracy,
    selectedTime,
    mistakes.size,
    totalKeystrokes,
  ]);

  // Restart
  useEffect(() => {
    restart();
  }, [restart]);

  // Updates
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Restart using tab key
      if (e.key === "Tab") {
        e.preventDefault();

        if (restartRef.current) {
          restartRef.current.click();
        }

        return;
      }

      // Test is done
      if (isFinished) return;

      // Prevent page scrolling
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      // Mistake
      if (e.key === "Backspace") {
        if (typed.length > 0) {
          const lastIndex = typed.length - 1;
          const wasCorrect = typed[lastIndex] === text[lastIndex];
          setTotalKeystrokes((prev) => Math.max(0, prev - 1));
          if (wasCorrect) {
            setCorrectKeystrokes((prev) => Math.max(0, prev - 1));
          }
          setTyped((prev) => prev.slice(0, -1));
          const newMistakes = new Set(mistakes);
          newMistakes.delete(lastIndex);
          setMistakes(newMistakes);
        }
        return;
      }

      if (
        e.key === " " &&
        typed.length > 0 &&
        typed[typed.length - 1] !== " "
      ) {
        setTyped((prev) => prev + " ");
        setTotalKeystrokes((prev) => prev + 1);
        if (text[typed.length] === " ") {
          setCorrectKeystrokes((prev) => prev + 1);
        }
        return;
      }

      if (e.key.length === 1) {
        const currentIndex = typed.length;
        if (currentIndex < text.length) {
          const isCorrect = e.key === text[currentIndex];
          setTotalKeystrokes((prev) => prev + 1);

          if (isCorrect) {
            setCorrectKeystrokes((prev) => prev + 1);
          } else {
            const newMistakes = new Set(mistakes);
            newMistakes.add(currentIndex);
            setMistakes(newMistakes);
          }

          setTyped((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typed, mistakes, text, restart, isFinished]);

  // Start only when first keystroke is made
  useEffect(() => {
    if (typed.length === 1) {
      setStartTime(Date.now());
      setIsActive(true);
    }
  }, [typed]);

  // Timer
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsActive(false);
            if (!resultsSaved) {
              saveResult();
              setResultsSaved(true);
            }

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft, resultsSaved, saveResult]);

  // Dynamic WPM
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        const stats = calculateStats();
        setWpm(stats.wpm);
        setRawWpm(stats.rawWpm);
        setAccuracy(stats.accuracy);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, calculateStats]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setLines(measureText(text));
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [text, measureText]);

  const renderText = () => {
    let typedSoFar = 0;
    const currentLineIndex = lines.findIndex((line) => {
      if (typedSoFar + line.length + 1 > typed.length) {
        return true;
      }
      typedSoFar += line.length + 1;
      return false;
    });

    const displayLines = lines
      .slice(
        Math.max(0, currentLineIndex - 1),
        Math.max(3, currentLineIndex + 2)
      )
      .slice(0, 3);

    return displayLines.map((line, lineIndex) => {
      const chars = line.split("");
      const lineStart = text.indexOf(line);

      return (
        <div key={lineIndex} className="h-[2.5em] whitespace-pre relative">
          {chars.map((char, charIndex) => {
            const absoluteIndex = lineStart + charIndex;
            return (
              <Character
                key={charIndex}
                char={char}
                isCurrent={absoluteIndex === typed.length}
                isTyped={absoluteIndex < typed.length}
                isCorrect={typed[absoluteIndex] === char}
                isMistake={mistakes.has(absoluteIndex)}
              />
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-fill w-full flex items-center justify-center mt-[7em]">
      <Card className="w-full max-w-4xl shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex justify-between items-center px-6 py-4 shadow-md rounded-md">
            <div className="flex items-center gap-4 ">
              <TimeButtons
                selectedTime={selectedTime}
                onTimeSelect={(time) => {
                  setSelectedTime(time);
                  restart();
                }}
                isActive={isActive}
              />
              <Button
                ref={restartRef}
                variant="outline"
                size="sm"
                onClick={restart}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Restart
              </Button>
            </div>
            <div>
              <ModeToggle />
            </div>
            <div>
              <Stats
                timeLeft={timeLeft}
                wpm={wpm}
                rawWpm={rawWpm}
                accuracy={accuracy}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="p-6 rounded-lg mb-4 font-mono leading-relaxed  overflow-hidden"
          >
            <div
              ref={textRef}
              tabIndex={0}
              className="h-[7.5em] focus:outline-none"
            >
              <AnimatePresence mode="wait">
                {isFinished ? (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-2xl">
                      Speed: <span className="font-bold">{wpm} wpm</span>
                    </p>
                    <p className="text-2xl">
                      Accuracy: <span className="font-bold">{accuracy}%</span>
                    </p>
                    <p className="text-xl">Raw Speed: {rawWpm} wpm</p>
                    <p className="text-lg mt-2">
                      Press Tab or click Restart to try again
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="transition-all duration-150"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {renderText()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Game;
