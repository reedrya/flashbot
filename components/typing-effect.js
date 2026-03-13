"use client";

import * as React from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export default function TypingEffect({
  text = 'Typing Effect',
  className = '',
  msPerChar = 22,
  startDelayMs = 120,
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setVisibleCount(text.length);
      return;
    }

    let cancelled = false;
    let timeoutId = null;
    let intervalId = null;

    setVisibleCount(0);

    timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      intervalId = window.setInterval(() => {
        setVisibleCount((prev) => {
          const next = Math.min(prev + 1, text.length);
          if (next >= text.length && intervalId) {
            window.clearInterval(intervalId);
          }
          return next;
        });
      }, Math.max(8, msPerChar));
    }, Math.max(0, startDelayMs));

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isInView, msPerChar, prefersReducedMotion, startDelayMs, text]);

  return (
    <span ref={ref} className={`typing-effect ${className}`.trim()}>
      {text.slice(0, visibleCount)}
      {!prefersReducedMotion ? <span className="typing-cursor" aria-hidden="true" /> : null}
    </span>
  );
}