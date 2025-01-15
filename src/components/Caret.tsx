"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const Caret = memo(() => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0.6 }}
    transition={{ duration: 0.1 }}
    className="absolute w-0.5 bg-blue-400"
    layoutId="caret"
    style={{ height: "1.4em" }}
  />
));

Caret.displayName = "Caret";
export default Caret;
