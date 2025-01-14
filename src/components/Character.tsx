import { memo } from "react";
import { CharacterProps } from "@/lib/types";
import { motion } from "framer-motion";
import Caret from "./Caret";

const Character = memo(({ char, isCurrent, isTyped, isCorrect, isMistake }: CharacterProps) => (
    <motion.span
        className={`
            ${isTyped && !isCorrect ? 'text-red-600' : ''}
            ${isTyped && isCorrect ? 'text-emerald-500' : ''}
            ${isMistake ? 'text-red-500' : ''}
            ${!isTyped ? 'text-gray-800 dark:text-gray-400' : ''}
            text-2xl relative inline-block
        `}
        layout
    >
        {isCurrent && <Caret />}
        {char}
    </motion.span>
));

Character.displayName = "Character";
export default Character;