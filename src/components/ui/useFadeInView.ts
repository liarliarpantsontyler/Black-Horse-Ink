"use client";

import { useReducedMotion, type HTMLMotionProps } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

export function useFadeInView(delay = 0): Pick<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
> {
  const reduceMotion = useReducedMotion();
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 1.8, delay, ease: EASE },
  };
}
