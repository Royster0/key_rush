"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const Caret = memo(() => (
    <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute w-0.5 bg-blue-500"
        layoutId="caret"
        style={{ height: "1.5em" }}
    />
));

Caret.displayName = "Caret";
export default Caret;