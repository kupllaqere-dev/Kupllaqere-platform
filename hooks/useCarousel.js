'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export function useCarousel(count, intervalMs = 5000) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % count);
    }, intervalMs);
  }, [count, intervalMs]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback((index) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setCurrent(index);
    startTimer();
    setTimeout(() => setTransitioning(false), 500);
  }, [transitioning, current, startTimer]);

  const next = useCallback(() => go((current + 1) % count), [current, count, go]);
  const prev = useCallback(() => go((current - 1 + count) % count), [current, count, go]);

  return { current, next, prev, go, transitioning };
}
