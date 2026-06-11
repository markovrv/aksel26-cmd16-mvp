import { useState, useRef, useCallback, useEffect } from "react";

export default function useTimer() {
  const [elapsed, setElapsed] = useState(0);       // в секундах
  const [running, setRunning] = useState(false);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    startRef.current = Date.now();
    setRunning(true);
    setElapsed(0);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    if (startRef.current) {
      const ms = Date.now() - startRef.current;
      setElapsed(Math.floor(ms / 1000));
      return ms; // возвращаем миллисекунды для бонусов
    }
    return 0;
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setElapsed(0);
    startRef.current = null;
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (startRef.current) {
          const ms = Date.now() - startRef.current;
          setElapsed(Math.floor(ms / 1000));
        }
      }, 250);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return { elapsed, formatted, running, start, stop, reset };
}