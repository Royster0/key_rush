export interface Stats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeLeft: number;
}

export interface TimeButtonsProps {
  selectedTime: number;
  onTimeSelect: (time: number) => void;
  isActive: boolean;
}

export interface CharacterProps {
  char: string;
  isCurrent: boolean;
  isTyped: boolean;
  isCorrect: boolean;
  isMistake: boolean;
}

export interface StatsDisplayProps {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timeLeft: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthenticatedResponse {
  user: User | null;
}
