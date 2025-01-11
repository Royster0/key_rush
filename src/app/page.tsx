"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

const WORD_POOL = [
  "apple", "table", "chair", "glass", "stone", "phone", "brick", "brush", "smile", "happy",
  "water", "cloud", "light", "night", "music", "sound", "earth", "flower", "green", "green",
  "dream", "jump", "fast", "slow", "star", "moon", "book", "desk", "pen", "pencil",
  "read", "write", "talk", "walk", "run", "fall", "stop", "time", "place", "learn",
  "sleep", "wake", "dance", "game", "card", "coin", "key", "lock", "gold", "ring",
  "blue", "red", "pink", "green", "yellow", "brown", "black", "white", "orange", "gray",
  "love", "kind", "good", "happy", "sad", "funny", "cool", "smart", "kind", "brave",
  "strong", "hard", "soft", "rich", "poor", "warm", "cold", "chill", "bright", "shiny",
  "calm", "wild", "crazy", "angry", "fun", "snow", "rain", "wind", "fire", "storm",
  "river", "lake", "sea", "ocean", "mount", "hill", "valley", "forest", "desert", "island",
  "plane", "train", "car", "bus", "bike", "ship", "boat", "truck", "scooter", "horse",
  "cat", "dog", "bird", "fish", "lion", "tiger", "bear", "wolf", "deer", "fox",
  "cow", "sheep", "goat", "chicken", "duck", "elephant", "giraffe", "zebra", "camel", "monkey",
  "apple", "peach", "melon", "grape", "lemon", "plum", "pear", "kiwi", "date", "fig",
  "carrot", "potato", "onion", "beans", "corn", "spinach", "lettuce", "tomato", "chili", "cabbage",
  "salt", "sugar", "pepper", "olive", "bacon", "bread", "cheese", "butter", "milk", "egg",
  "meat", "fish", "chicken", "beef", "pork", "bake", "boil", "fry", "grill", "steam",
  "sweet", "bitter", "sour", "salty", "spicy", "tasty", "fresh", "roast", "mash", "cook",
  "eat", "drink", "serve", "plate", "knife", "fork", "spoon", "cup", "mug", "glass",
  "salt", "pepper", "knife", "fork", "bowl", "plate", "spoon", "cup", "fork", "spoon",
  "sauce", "beet", "fruit", "meat", "lunch", "dinner", "break", "lemon", "fruit", "berry",
  "bake", "fry", "steam", "grill", "roast", "boil", "roast", "stew", "broil", "poach",
  "clean", "wash", "dry", "fold", "iron", "sweep", "mop", "dust", "vacuum", "scrub",
  "paint", "color", "draw", "sketch", "shade", "sculpt", "glue", "cut", "sew", "craft",
  "work", "study", "read", "write", "plan", "think", "talk", "learn", "teach", "listen",
  "speak", "argue", "debate", "discuss", "gather", "meet", "join", "share", "give", "help",
  "love", "care", "hug", "kiss", "hold", "talk", "call", "chat", "email", "text",
  "listen", "hear", "see", "watch", "feel", "smell", "touch", "move", "stand", "sit",
  "stand", "walk", "run", "jump", "play", "work", "rest", "stop", "start", "finish",
  "go", "stay", "return", "leave", "enter", "exit", "buy", "sell", "pay", "save",
  "spend", "share", "keep", "lend", "borrow", "find", "lose", "search", "look", "seek",
  "fix", "build", "create", "make", "build", "plant", "grow", "cut", "dig", "harvest",
  "clean", "wash", "cook", "bake", "grill", "serve", "taste", "smell", "look", "watch"
]


const TIME_OPTIONS = [5, 15, 30, 60, 120];

export default function Home() {
  const [selectedTime, setSelectedTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mistakes, setMistakes] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const textRef = useRef<HTMLDivElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Creates string of words
  const generateText = useCallback(() => {
    const words = [];

    for (let i = 0; i < 400; i++) {
      words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
    }

    return words.join(" ");
  }, []);

  const splitTextToLines = useCallback((fullText: string) => {
    if (!containerRef.current) return [];

    const container = containerRef.current;
    const temp = document.createElement("div");
    temp.style.visibility = "hidden";
    temp.style.position = "absolute";
    temp.style.whiteSpace = "pre";
    temp.style.fontSize = "1.5rem";
    temp.style.fontFamily = "monospace";
    container.appendChild(temp); 

    const maxWidth = container.clientWidth - 48;
    let currentLine = "";
    const lines = [];
    const words = fullText.split(" ");

    for (const word of words) {
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
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    container.removeChild(temp);
    return lines;
  }, []);

  const calculateWPM = useCallback(() => {
    if (!startTime) return 0;
    
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000 / 60;
    const charactersTyped = typed.length;
    const wordsTyped = charactersTyped / 5;

    return Math.round(wordsTyped / elapsedTime);
  }, [startTime, typed]);

  const restart = useCallback(() => {
    const newText = generateText();
    setText(newText);
    setLines(splitTextToLines(newText));
    setTyped("");
    setStartTime(null);
    setWpm(0);
    setIsActive(false);
    setMistakes(new Set());
    setTimeLeft(selectedTime);
    setIsFinished(false);

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
  }, [selectedTime, generateText, splitTextToLines]);

  // Restart
  useEffect(() => {
    restart();
  }, [restart]);

  // Updates
  useEffect(() => {
    const handleKeyDown = (e: { key: string | any[]; preventDefault: () => void; }) => {
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
        setTyped((prev) => prev.slice(0, -1));
        const newMistakes = new Set(mistakes);
        newMistakes.delete(typed.length - 1);
        setMistakes(newMistakes);
        
        return;
      }

      if (e.key === " " && typed.length > 0 && typed[typed.length - 1] !== " ") {
        setTyped((prev) => prev + " ");
        
        return;
      }

      if (e.key.length === 1) {
        const currentIndex = typed.length;
        if (currentIndex < text.length) {
          const isCorrect = e.key === text[currentIndex];
          
          if (!isCorrect) {
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

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft]);

  // Dynamic WPM
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setWpm(calculateWPM());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, calculateWPM]);

  const renderText = () => {
    let typedSoFar = 0;
    const currentLineIndex = lines.findIndex(line => {
      if (typedSoFar + line.length + 1 > typed.length) {
        return true;
      }
      typedSoFar += line.length + 1;
      return false;
    });

    const displayLines = lines.slice(
      Math.max(0, currentLineIndex - 1),
      Math.max(3, currentLineIndex + 2)
    ).slice(0, 3);

    return displayLines.map((line, lineIndex) => {
      const chars = line.split('');
      
      return (
        <div key={lineIndex} className="h-[2.5em] whitespace-pre">
          {chars.map((char, charIndex) => {
            const absoluteIndex = text.indexOf(line) + charIndex;
            const isCurrent = absoluteIndex === typed.length;
            const isTyped = absoluteIndex < typed.length;
            const isCorrect = typed[absoluteIndex] === char;
            const isMistake = mistakes.has(absoluteIndex);

            return (
              <span
                key={charIndex}
                className={`
                  ${isCurrent ? 'border-l-2 border-blue-500' : ''}
                  ${isTyped && !isCorrect ? 'text-red-600' : ''}
                  ${isTyped && isCorrect ? 'text-emerald-500' : ''}
                  ${isMistake ? 'text-red-500' : ''}
                  ${!isTyped ? 'text-gray-800 dark:text-gray-400' : ''}
                  text-2xl
                `}
              >
                {char}
              </span>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-4xl shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex justify-between items-center px-6 py-4 shadow-md rounded-md">
            <div className="flex items-center gap-4 ">
              <span>Key Rush</span>
              <div className="flex gap-2">
                {TIME_OPTIONS.map(time => (
                  <Button
                    key={time}
                    variant={time === selectedTime ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTime(time);
                      restart();
                    }}
                    disabled={isActive}
                  >
                    {time}s
                  </Button>
                ))}
              </div>
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
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">{timeLeft}s</span>
              <span className="text-2xl font-bold">{wpm} WPM</span>
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
              {isFinished ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Time's up!</h2>
                  <p className="text-xl">Final Speed: {wpm} WPM</p>
                  <p className="text-lg mt-2">Press ESC or click Restart to try again</p>
                </div>
              ) : (
                <div className="transition-all duration-150">
                  {renderText()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
