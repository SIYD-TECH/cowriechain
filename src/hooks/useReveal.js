"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Wraps Framer's useInView for section reveals.
 * Returns [ref, inView] — attach ref to the section, use inView to drive variants.
 * Respects prefers-reduced-motion via the caller's variants (handled per-section).
 */
export function useReveal(amount = 0.2) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return [ref, inView];
}
