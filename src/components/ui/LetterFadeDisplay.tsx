"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const HEADLINE_EASE = [0.25, 0.1, 0.25, 1] as const;

const headlineContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

const headlineLetter = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.65, ease: HEADLINE_EASE },
  },
};

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

type Props = {
  text: string;
  as?: keyof typeof motionTags;
  className?: string;
  /** mount: on page load; inView: when scrolled into viewport */
  when?: "mount" | "inView";
};

export function LetterFadeDisplay({
  text,
  as: tag = "h1",
  className = "",
  when = "mount",
}: Props) {
  const reduceMotion = useReducedMotion();
  const letters = useMemo(() => text.split(""), [text]);
  const MotionTag = motionTags[tag];

  const containerVariants = reduceMotion
    ? { hidden: {}, visible: {} }
    : headlineContainer;
  const letterVariants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : headlineLetter;

  const motionProps =
    when === "inView"
      ? {
          initial: reduceMotion ? ("visible" as const) : ("hidden" as const),
          whileInView: "visible" as const,
          viewport: { once: true, amount: 0.35 },
        }
      : {
          initial: reduceMotion ? ("visible" as const) : ("hidden" as const),
          animate: "visible" as const,
        };

  return (
    <MotionTag className={className} variants={containerVariants} {...motionProps}>
      {letters.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          variants={letterVariants}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionTag>
  );
}
